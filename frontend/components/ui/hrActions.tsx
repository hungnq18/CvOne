import React from 'react';
import { FileText, Download, User } from 'lucide-react';
import styles from '../../styles/hrActions.module.css';

interface DocumentActionsProps {
    onViewCV?: () => void;
    onDownloadCV?: () => void;
    onViewCL?: () => void;
    onDownloadCL?: () => void;
}

const DocumentActions: React.FC<DocumentActionsProps> = ({ onViewCV, onDownloadCV, onViewCL, onDownloadCL }) => (
    <div className={styles.card}>
        <ul className={styles.list}>
            <li className={styles.element} onClick={onViewCV}>
                <FileText style={{ color: '#1e40af' }} />
                <span className={styles.label}>View CV</span>
            </li>
            <li className={styles.element} onClick={onDownloadCV}>
                <Download style={{ color: '#1e40af' }} />
                <span className={styles.label}>Download CV</span>
            </li>
        </ul>
        <div className={styles.separator}></div>
        <ul className={styles.list}>
            <li className={styles.element} onClick={onViewCL}>
                <User style={{ color: '#047857' }} />
                <span className={styles.label}>View CL</span>
            </li>
            <li className={styles.element} onClick={onDownloadCL}>
                <Download style={{ color: '#047857' }} />
                <span className={styles.label}>Download CL</span>
            </li>
        </ul>
    </div>
);

export default DocumentActions; 