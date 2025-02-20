import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/auth';
import styles from './Auth.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    // Validate fields
    if (!formData.email || !formData.password) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Sending login data:', { email: formData.email });
      const data = await loginUser({
        email: formData.email,
        password: formData.password,
      });
      console.log('Login successful:', data);

      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <div className={styles.error}>{error}</div>}
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
        <button
          type="submit"
          className={`${styles.button} ${isLoading ? styles.loading : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <p className={styles.toggleForm}>
          Don't have an account?{' '}
          <span
            onClick={() => !isLoading && navigate('/signup')}
            className={`${styles.toggleLink} ${
              isLoading ? styles.disabled : ''
            }`}
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
