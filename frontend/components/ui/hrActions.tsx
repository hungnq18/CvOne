import React, { useState, useRef, useEffect } from 'react';
import { FileText, Download, User, Menu, Trash2 } from 'lucide-react';
import styles from '../../styles/hrActions.module.css';
import { createPortal } from 'react-dom';

interface DocumentActionsProps {
    onViewCV?: () => void;
    onDownloadCV?: () => void;
    onViewCL?: () => void;
    onDownloadCL?: () => void;
    status?: string;
    onDelete?: () => void;
    cvId?: string;
    cvUrl?: string;
    clId?: string;
    clUrl?: string;
}

const MENU_WIDTH = 220;

const DocumentActions: React.FC<DocumentActionsProps> = ({ onViewCV, onDownloadCV, onViewCL, onDownloadCL, status, onDelete, cvId, cvUrl, clId, clUrl }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    const handleOpenMenu = () => {
        if (ref.current) {
            const rect = ref.current.getBoundingClientRect();
            let left = rect.left + window.scrollX;
            if (left + MENU_WIDTH > window.innerWidth) {
                left = window.innerWidth - MENU_WIDTH - 8;
            }
            setMenuPos({ top: rect.bottom + window.scrollY, left });
        }
        setOpen((v) => !v);
    };

    // Đóng menu trước khi gọi callback action
    const handleAction = (cb?: () => void) => {
        setOpen(false);
        if (cb) cb();
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }} ref={ref}>
            <button
                className={styles.menu__icon}
                onClick={handleOpenMenu}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                aria-label="Open document actions"
            >
                <Menu />
            </button>
            {open && typeof window !== 'undefined' && createPortal(
                <div
                    style={{
                        position: 'absolute',
                        top: menuPos.top,
                        left: menuPos.left,
                        zIndex: 9999,
                        overflow: 'visible',
                        maxHeight: 'none',
                        width: MENU_WIDTH,
                    }}
                >
                    <div className={styles.card} style={{ overflow: 'visible', maxHeight: 'none', width: MENU_WIDTH }}
                        onClick={e => e.stopPropagation()} // Ngăn đóng menu khi click vào menu
                    >
                        <ul className={styles.list}>
                            <li className={styles.element} onClick={() => {
                                if (cvId) handleAction(onViewCV);
                                else if (cvUrl) window.open(cvUrl, '_blank');
                            }}>
                                <FileText style={{ color: '#1e40af' }} />
                                <span className={styles.label}>View CV</span>
                            </li>
                            <li className={styles.element} onClick={() => {
                                if (cvId) handleAction(onDownloadCV);
                                else if (cvUrl) {
                                    const link = document.createElement('a');
                                    link.href = cvUrl;
                                    link.download = '';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    setOpen(false);
                                }
                            }}>
                                <Download style={{ color: '#1e40af' }} />
                                <span className={styles.label}>Download CV</span>
                            </li>
                        </ul>
                        <div className={styles.separator}></div>
                        <ul className={styles.list}>
                            <li className={styles.element} onClick={() => {
                                if (clId) handleAction(onViewCL);
                                else if (clUrl) window.open(clUrl, '_blank');
                            }}>
                                <User style={{ color: '#047857' }} />
                                <span className={styles.label}>View CL</span>
                            </li>
                            <li className={styles.element} onClick={() => {
                                if (clId) handleAction(onDownloadCL);
                                else if (clUrl) {
                                    const link = document.createElement('a');
                                    link.href = clUrl;
                                    link.download = '';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    setOpen(false);
                                }
                            }}>
                                <Download style={{ color: '#047857' }} />
                                <span className={styles.label}>Download CL</span>
                            </li>
                        </ul>
                        {status === 'rejected' && onDelete && (
                            <>
                                <div className={styles.separator}></div>
                                <ul className={styles.list}>
                                    <li className={styles.element} onClick={() => handleAction(onDelete)} style={{ color: '#e11d48' }}>
                                        <Trash2 style={{ color: '#e11d48' }} />
                                        <span className={styles.label}>Delete</span>
                                    </li>
                                </ul>
                            </>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default DocumentActions; 