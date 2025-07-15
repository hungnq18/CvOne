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
}

const MENU_WIDTH = 220;

const DocumentActions: React.FC<DocumentActionsProps> = ({ onViewCV, onDownloadCV, onViewCL, onDownloadCL, status, onDelete }) => {
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
                        onClick={() => { console.log('Click vào card menu'); }}
                    >
                        <ul className={styles.list}>
                            <li className={styles.element} onClick={() => handleAction(onViewCV)}>
                                <FileText style={{ color: '#1e40af' }} />
                                <span className={styles.label}>View CV</span>
                            </li>
                            <li className={styles.element} onClick={() => handleAction(onDownloadCV)}>
                                <Download style={{ color: '#1e40af' }} />
                                <span className={styles.label}>Download CV</span>
                            </li>
                        </ul>
                        <div className={styles.separator}></div>
                        <ul className={styles.list}>
                            <li className={styles.element} onClick={() => handleAction(onViewCL)}>
                                <User style={{ color: '#047857' }} />
                                <span className={styles.label}>View CL</span>
                            </li>
                            <li className={styles.element} onClick={() => handleAction(onDownloadCL)}>
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