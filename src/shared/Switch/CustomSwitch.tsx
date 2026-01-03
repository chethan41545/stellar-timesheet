import React from "react";
import styles from "./CustomSwitch.module.css";

interface SwitchProps {
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    id?: string;
}

const CustomSwitch: React.FC<SwitchProps> = ({
    checked,
    onChange,
    id = "ios-switch",
}) => {
    return (
        <label className={styles.root}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
            />
            <span className={styles.track}>
                <span className={styles.thumb} />
            </span>
        </label>
    );
};

export default CustomSwitch;
