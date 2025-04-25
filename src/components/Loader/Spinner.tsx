import React from 'react';
import styles from './Spinner.module.css';

const LoadingSpinner: React.FC = () => {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}></div>
      <p>Cargando...</p>
    </div>
  );
};

export default LoadingSpinner;