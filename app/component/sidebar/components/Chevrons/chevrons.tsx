import React from "react";
import styles from "./cheverons.module.css";

interface ChevronsProps {
  isHovered?: boolean;
}

export const Chevrons: React.FC<ChevronsProps> = ({ isHovered = false }) => {
  return (
    <svg
      width="23"
      height="16"
      viewBox="0 0 25 16"
      xmlns="http://www.w3.org/2000/svg"
      className={styles.svg}
    >
      <g
        className={`${styles.chevrons} ${isHovered ? styles.flipped : ''}`}
        fill="none"
        stroke="#F2F2F2"
        strokeWidth="3.84"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1.92017 1.92017L8.46076 6.45054C10.2084 7.66104 10.2084 8.17929 8.46076 9.38979L1.92017 13.9202" />
        <path d="M14.4466 1.92017L20.9872 6.45054C22.7348 7.66104 22.7348 8.17929 20.9872 9.38979L14.4466 13.9202" />
      </g>
    </svg>
  );
};
