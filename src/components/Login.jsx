import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

const Login = ({ initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  const toggleMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    navigate(newMode ? '/login' : '/signup');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</h1>
      <form className={styles.form}>
        {!isLogin && (
          <input type="text" placeholder="Full Name" className={styles.input} />
        )}
        <input type="text" placeholder="Username" className={styles.input} />
        <input
          type="password"
          placeholder="Password"
          className={styles.input}
        />
        {!isLogin && (
          <input
            type="password"
            placeholder="Confirm Password"
            className={styles.input}
          />
        )}
        <button type="submit" className={styles.button}>
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
        <p className={styles.toggleForm}>
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span onClick={toggleMode} className={styles.toggleLink}>
            {isLogin ? 'Sign Up' : 'Login'}
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
