import React from 'react';
import styles from './styles.module.css';

interface CrispProps {
  letterData: {
    firstName: string;
    lastName: string;
    profession: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
    date: string;
    recipientName: string;
    companyName: string;
    companyAddress: string;
    subject: string;
    greeting: string;
    opening: string;
    body: string;
    closing: string;
    signature: string;
  };
}

const Crisp: React.FC<CrispProps> = ({ letterData }) => {
  return (
    <div className={styles.crisp}>
      <div className={styles.header}>
        <div className={styles.nameContainer}>
          <h1 className={styles.name}>{`${letterData.firstName} ${letterData.lastName}`}</h1>
          <div className={styles.profession}>{letterData.profession}</div>
        </div>
        <div className={styles.contactInfo}>
          <div className={styles.contactItem}>
            <span className={styles.label}>Email:</span>
            <span>{letterData.email}</span>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.label}>Phone:</span>
            <span>{letterData.phone}</span>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.label}>Address:</span>
            <span>{`${letterData.city}, ${letterData.state} ${letterData.zip}`}</span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.date}>{letterData.date}</div>

        <div className={styles.recipient}>
          <div>{letterData.recipientName}</div>
          <div>{letterData.companyName}</div>
          <div>{letterData.companyAddress}</div>
        </div>

        <div className={styles.subject}>{letterData.subject}</div>

        <div className={styles.greeting}>{letterData.greeting}</div>

        <div className={styles.body}>
          <div className={styles.opening}>{letterData.opening}</div>
          <div className={styles.mainBody}>{letterData.body}</div>
          <div className={styles.closing}>{letterData.closing}</div>
        </div>

        <div className={styles.signature}>{letterData.signature}</div>
      </div>
    </div>
  );
};

export default Crisp;