import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupUser } from '../services/auth';
import styles from './Auth.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'student',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate all required fields
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Remove confirmPassword and create registration data
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      console.log('Sending registration data:', registrationData);

      const data = await signupUser(registrationData);
      console.log('Registration successful:', data);

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Sign Up</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}
        <input
          type="text"
          name="username"
          placeholder="Username"
          className={styles.input}
          value={formData.username}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          className={styles.input}
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        <select
          name="role"
          className={styles.input}
          value={formData.role}
          onChange={handleChange}
          disabled={isLoading}
          required
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
        <input
          type="password"
          name="password"
          placeholder="Password"
          className={styles.input}
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          className={styles.input}
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={isLoading}
          required
        />
        <button
          type="submit"
          className={`${styles.button} ${isLoading ? styles.loading : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Signing Up...' : 'Sign Up'}
        </button>
        <p className={styles.toggleForm}>
          Already have an account?{' '}
          <span
            onClick={() => !isLoading && navigate('/login')}
            className={`${styles.toggleLink} ${
              isLoading ? styles.disabled : ''
            }`}
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;
