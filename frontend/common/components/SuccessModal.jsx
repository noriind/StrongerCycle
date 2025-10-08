import styles from '../styles/SuccessModal.module.css';

export default function SuccessModal({ 
  isVisible, 
  title = "Success!", 
  message = "Operation completed successfully.",
  subtext = "",
  icon = "🎉",
  onClose = null,
  autoCloseDelay = 0 // 0 means no auto-close
}) {
  
  // Auto-close functionality
  if (isVisible && autoCloseDelay > 0 && onClose) {
    setTimeout(() => {
      onClose();
    }, autoCloseDelay);
  }

  if (!isVisible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalIcon}>
          {icon}
        </div>
        <h2 className={styles.modalTitle}>{title}</h2>
        <p className={styles.modalMessage}>
          {message}
        </p>
        {subtext && (
          <div className={styles.modalSubtext}>
            {subtext}
          </div>
        )}
        {autoCloseDelay > 0 && (
          <div className={styles.loadingDots}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        {onClose && autoCloseDelay === 0 && (
          <button 
            className={styles.closeButton}
            onClick={onClose}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}