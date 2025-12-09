// Button.tsx
// Button.tsx
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonProps = {
  label?: string;                    // keep label for simple cases
  children?: ReactNode;              // OR pass custom content
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary" | "danger" | "tertiary" | "success";
  disabled?: boolean;
  onClick?: () => void;
  fullWidth?: boolean;
  leftIcon?: ReactNode;              // NEW
  rightIcon?: ReactNode;             // NEW
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({
  label,
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  onClick,
  fullWidth = false,
  leftIcon,
  rightIcon,
   ...rest
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${fullWidth ? styles.full : ""}`} {...rest}
      disabled={disabled}
      onClick={onClick}
    >
      {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
      {children ?? label}
      {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
    </button>
  );
};

export default Button;
