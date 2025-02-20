const API_URL = '/api/auth';

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }

    // Store the token if it exists in the response
    if (data.data?.token) {
      localStorage.setItem('token', data.data.token);
    }

    return data.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const signupUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Add this for cookies
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Registration failed');
    }

    // Store the token if it exists in the response
    if (data.data?.token) {
      localStorage.setItem('token', data.data.token);
    }

    return data.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};
