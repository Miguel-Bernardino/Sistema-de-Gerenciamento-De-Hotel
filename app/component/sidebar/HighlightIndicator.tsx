import React, { useId } from 'react';
import style from './sidebar.module.css';

interface HighlightIndicatorProps {
  inline?: boolean; // true when sidebar expanded; false overlay in collapsed state
}

export const HighlightIndicator: React.FC<HighlightIndicatorProps> = ({ inline = true }) => {
  const filterId = useId().replace(/:/g, '');
  return (
    <svg
      className={inline ? style.activeIndicatorInline : style.activeIndicatorOverlay}
      width={12}
      height={50}
      viewBox="0 0 20 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter={`url(#${filterId})`}>
        <path
          d="M-1 12C2.91824 12 6.09459 15.1764 6.09459 19.0946V64.9054C6.09459 68.8236 2.91824 72 -1 72V12Z"
          fill="#00C3B0"
        />
      </g>
      <defs>
        <filter
          id={filterId}
          x="-13"
          y="0"
          width="31.0946"
          height="84"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology radius="1" operator="dilate" in="SourceAlpha" result="effect1_dropShadow" />
          <feOffset />
          <feGaussianBlur stdDeviation="5.5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0.764706 0 0 0 0 0.690196 0 0 0 1 0"
          />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
        </filter>
      </defs>
    </svg>
  );
};

export default HighlightIndicator;