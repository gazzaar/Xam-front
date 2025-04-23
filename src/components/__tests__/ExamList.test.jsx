import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { examService } from '../../services/api';
import ExamList from '../instructor/ExamList';

// Mock the examService
vi.mock('../../services/api', () => ({
  examService: {
    getExams: vi.fn(),
    deleteExam: vi.fn(),
  },
}));

describe('ExamList Component', () => {
  const mockExams = [
    {
      exam_id: 1,
      exam_name: 'Test Exam 1',
      description: 'Test Description 1',
      start_date: '2025-04-17T00:03:00.000Z',
      end_date: '2025-04-17T21:02:00.000Z',
      duration: 60,
      total_students: 5,
      attempts_made: 0,
      student_access_codes: [
        { email: 'student1@test.com', access_code: 'ABC123' },
        { email: 'student2@test.com', access_code: 'DEF456' },
      ],
    },
    {
      exam_id: 2,
      exam_name: 'Test Exam 2',
      description: 'Test Description 2',
      start_date: '2024-04-01T00:00:00.000Z',
      end_date: '2024-04-02T00:00:00.000Z',
      duration: 90,
      total_students: 3,
      attempts_made: 2,
      student_access_codes: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders loading spinner initially', () => {
    examService.getExams.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <ExamList />
      </BrowserRouter>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('renders exam list successfully', async () => {
    examService.getExams.mockResolvedValueOnce({
      success: true,
      data: mockExams,
    });

    render(
      <BrowserRouter>
        <ExamList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Exam 1')).toBeInTheDocument();
      expect(screen.getByText('Test Exam 2')).toBeInTheDocument();
    });

    expect(screen.getByText('60 minutes')).toBeInTheDocument();
    expect(screen.getByText('90 minutes')).toBeInTheDocument();
  });

  test('handles exam deletion', async () => {
    examService.getExams.mockResolvedValueOnce({
      success: true,
      data: mockExams,
    });
    examService.deleteExam.mockResolvedValueOnce({ success: true });

    render(
      <BrowserRouter>
        <ExamList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Exam 1')).toBeInTheDocument();
    });

    // Find and click delete button for the first exam
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Confirm deletion in the modal
    const confirmButton = screen.getByText('Delete', { selector: 'button' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(examService.deleteExam).toHaveBeenCalledWith(1);
      expect(examService.getExams).toHaveBeenCalledTimes(2);
    });
  });

  test('handles exam deletion error', async () => {
    examService.getExams.mockResolvedValueOnce({
      success: true,
      data: mockExams,
    });
    examService.deleteExam.mockRejectedValueOnce({
      message: 'Failed to delete exam',
    });

    render(
      <BrowserRouter>
        <ExamList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Exam 1')).toBeInTheDocument();
    });

    // Find and click delete button for the first exam
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Confirm deletion in the modal
    const confirmButton = screen.getByText('Delete', { selector: 'button' });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to delete exam')).toBeInTheDocument();
    });
  });

  test('displays correct exam status', async () => {
    examService.getExams.mockResolvedValueOnce({
      success: true,
      data: mockExams,
    });

    render(
      <BrowserRouter>
        <ExamList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  test('allows downloading access codes', async () => {
    examService.getExams.mockResolvedValueOnce({
      success: true,
      data: mockExams,
    });

    // Mock URL.createObjectURL and document.createElement
    const mockUrl = 'blob:test';
    global.URL.createObjectURL = vi.fn(() => mockUrl);
    const mockAnchor = { click: vi.fn(), setAttribute: vi.fn() };
    document.createElement = vi.fn(() => mockAnchor);
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();

    render(
      <BrowserRouter>
        <ExamList />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Download Access Codes')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Download Access Codes'));

    expect(mockAnchor.setAttribute).toHaveBeenCalledWith(
      'download',
      expect.stringContaining('access_codes')
    );
    expect(mockAnchor.click).toHaveBeenCalled();
  });
});
