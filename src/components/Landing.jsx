import { useNavigate } from 'react-router-dom';
import styles from './Landing.module.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Welcome to TestNova</h1>
        <h2 className={styles.subtitle}>
          Your Modern Online Examination Platform
        </h2>

        <div className={styles.features}>
          <div className={styles.feature}>
            <h3>Secure Testing</h3>
            <p>
              Advanced proctoring and anti-cheating measures to ensure test
              integrity
            </p>
          </div>
          <div className={styles.feature}>
            <h3>Real-time Results</h3>
            <p>Instant grading and detailed performance analytics</p>
          </div>
          <div className={styles.feature}>
            <h3>Flexible Format</h3>
            <p>Support for multiple question types and exam structures</p>
          </div>
        </div>

        <div className={styles.cta}>
          <button
            className={styles.primaryButton}
            onClick={() => navigate('/signup')}
          >
            Get Started
          </button>
          <button
            className={styles.secondaryButton}
            onClick={() => navigate('/login')}
          >
            Login to Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
