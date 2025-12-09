import { FaSearch } from "react-icons/fa";
import styles from "./SearchField.module.css";

type Props = {
  name: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;  // fires on Enter or icon click
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  width?: string;
};

export default function SearchField({
  name,
  value,
  placeholder = "Find Preferred Vendors",
  onChange,
  onSearch,
  disabled = false,
  fullWidth = false,
  className = "",
  width = "100%"
}: Props) {
  return (
    <div
      className={[
        styles.search,
        fullWidth ? styles.full : "",
        disabled ? styles.disabled : "",
        className,
      ].join(" ")}

      style={{ width: width }}
    >
      <input
        type="text"
        name={name}
        value={value}
        placeholder={placeholder}
        className={styles.input}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSearch) onSearch(value);
        }}
        disabled={disabled}
        aria-label={placeholder}
      />

      <button
        type="button"
        className={styles.iconBtn}
        onClick={() => onSearch?.(value)}
        disabled={disabled}
        aria-label="Search"
      >
        <FaSearch className={styles.icon} />
      </button>
    </div>
  );
}
