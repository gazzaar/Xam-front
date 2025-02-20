import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div
        className={styles.logo}
        onClick={() => navigate('/')}
        role="button"
        tabIndex={0}
      >
        TestNova
      </div>
      <nav className={styles.nav}>
        <button
          className={styles.authButton}
          onClick={() => navigate('/login')}
        >
          Login
        </button>
        <button
          className={`${styles.authButton} ${styles.signupButton}`}
          onClick={() => navigate('/signup')}
        >
          Sign Up
        </button>
      </nav>
    </header>
  );
};

export default Header;
