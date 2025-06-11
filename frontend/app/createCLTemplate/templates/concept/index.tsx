import React from 'react';
import styles from './styles.module.css';

interface ConceptProps {
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

const Concept: React.FC<ConceptProps> = ({ letterData }) => {
  return (
    <div className={styles.concept}>
      <div className={styles.sidebar}>
        <div className={styles.nameContainer}>
          <h1 className={styles.name}>{`${letterData.firstName} ${letterData.lastName}`}</h1>
          <div className={styles.profession}>{letterData.profession}</div>
        </div>
        <div className={styles.contactInfo}>
          <div className={styles.contactItem}>
            <div className={styles.icon}>📧</div>
            <div>{letterData.email}</div>
          </div>
          <div className={styles.contactItem}>
            <div className={styles.icon}>📱</div>
            <div>{letterData.phone}</div>
          </div>
          <div className={styles.contactItem}>
            <div className={styles.icon}>📍</div>
            <div>{`${letterData.city}, ${letterData.state} ${letterData.zip}`}</div>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
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

export default Concept;