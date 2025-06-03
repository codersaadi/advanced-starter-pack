import type React from 'react';
import styles from './callout.module.css'; // Import the CSS module
type CalloutType = 'info' | 'warning' | 'danger' | 'tip';

interface CalloutProps {
  type?: CalloutType;
  children: React.ReactNode;
}

const Callout: React.FC<CalloutProps> = ({ type = 'info', children }) => {
  // Combine the base class with the type-specific class
  const combinedClassName = `${styles.callout} ${styles[type] || styles.info}`;

  return (
    <div className={combinedClassName} role="alert">
      {children}
    </div>
  );
};

export default Callout;
