import React from 'react';
import styles from './CustomRadioGroup.module.css';

interface Option {
    label: string;
    value: string;
}

interface CustomRadioGroupProps {
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    name: string;
}

export const CustomRadioGroup: React.FC<CustomRadioGroupProps> = ({ value, onChange, options, name }) => {
    return (
        <div className={styles.customRadioGroup}>
            {options.map(opt => (
                <label key={opt.value} className={styles.customRadioContainer}>
                    <input
                        type="radio"
                        name={name}
                        value={opt.value}
                        checked={value === opt.value}
                        onChange={() => onChange(opt.value)}
                        className={styles.customRadioInput}
                    />
                    <span className={styles.customRadioCheckmark}></span>
                    {opt.label}
                </label>
            ))}
        </div>
    );
};
export default CustomRadioGroup; 