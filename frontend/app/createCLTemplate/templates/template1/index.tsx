import React from 'react';
import styles from './styles.module.css';

interface Template1Props {
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

const Template1: React.FC<Template1Props> = ({ letterData }) => {
  return (
    <div className={styles.template1}>
      <div className={styles.header}>
        <h1 className={styles.name}>
          <span>{letterData.firstName}</span>
          <span>{letterData.lastName}</span>
        </h1>
        <div className={styles.contactInfo}>
          <div>Address</div>
          <div>{`${letterData.city}, ${letterData.state}, ${letterData.zip}`}</div>
          <div className={styles.email}>{letterData.email}</div>
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

export default Template1;