import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { authService } from '../../services/api';
import Login from '../Login';

// Mock the authService
vi.mock('../../services/api', () => ({
  authService: {
    login: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders login form', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in/i })
    ).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    const mockLoginResponse = {
      success: true,
      user: {
        role: 'instructor',
        isApproved: true,
      },
    };

    authService.login.mockResolvedValueOnce(mockLoginResponse);

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/instructor/dashboard');
    });
  });

  test('handles login error', async () => {
    const mockErrorResponse = {
      success: false,
      message: 'Invalid credentials',
    };

    authService.login.mockRejectedValueOnce(mockErrorResponse);

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('handles unapproved user login', async () => {
    const mockUnapprovedResponse = {
      success: true,
      user: {
        role: 'instructor',
        isApproved: false,
      },
    };

    authService.login.mockResolvedValueOnce(mockUnapprovedResponse);

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Your account is pending approval/i)
      ).toBeInTheDocument();
    });
  });
});
