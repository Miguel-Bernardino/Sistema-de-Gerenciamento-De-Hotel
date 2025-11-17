import { useEffect, type ReactNode, type CSSProperties } from 'react';
import styles from './Modal.module.css';

type ModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
type AnimationType = 'slideIn' | 'fadeIn' | 'scaleIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'none';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  position?: ModalPosition;
  padding?: string | { top?: string; right?: string; bottom?: string; left?: string };
  margin?: string | { top?: string; right?: string; bottom?: string; left?: string };
  className?: string;
  overlayClassName?: string;
  backgroundColor?: string;
  scrollbarThumbColor?: string;
  scrollbarTrackColor?: string;
  borderRadius?: string | { topLeft?: string; topRight?: string; bottomRight?: string; bottomLeft?: string };
  borderWidth?: string | { top?: string; right?: string; bottom?: string; left?: string };
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset' | 'none';
  maxWidth?: string;
  minWidth?: string;
  maxHeight?: string;
  minHeight?: string;
  titleColor?: string;
  closeButtonColor?: string;
  closeButtonHoverColor?: string;
  showHeader?: boolean;
  customCloseIcon?: ReactNode;
  animationType?: AnimationType;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, position = 'center', padding, margin, className, overlayClassName, backgroundColor, scrollbarThumbColor, scrollbarTrackColor, borderRadius, borderWidth, borderColor, borderStyle = 'solid', maxWidth, minWidth, maxHeight, minHeight, titleColor, closeButtonColor, closeButtonHoverColor, showHeader = true, customCloseIcon, animationType = 'slideIn' }) => {
  
  const getStyleValue = (value?: string | { top?: string; right?: string; bottom?: string; left?: string }) => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    const { top = '0', right = '0', bottom = '0', left = '0' } = value;
    return `${top} ${right} ${bottom} ${left}`;
  };

  const getBorderRadiusValue = (value?: string | { topLeft?: string; topRight?: string; bottomRight?: string; bottomLeft?: string }) => {
    if (!value) return undefined;
    if (typeof value === 'string') return value;
    const { topLeft = '0', topRight = '0', bottomRight = '0', bottomLeft = '0' } = value;
    return `${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`;
  };

  const modalStyle: CSSProperties = {
    padding: getStyleValue(padding),
    margin: getStyleValue(margin),
    backgroundColor: backgroundColor,
    borderRadius: getBorderRadiusValue(borderRadius),
    borderWidth: getStyleValue(borderWidth),
    borderColor: borderColor,
    borderStyle: borderStyle,
    maxWidth: maxWidth,
    minWidth: minWidth,
    maxHeight: maxHeight,
    minHeight: minHeight,
    // @ts-ignore - CSS custom properties
    '--scrollbar-thumb-color': scrollbarThumbColor,
    '--scrollbar-track-color': scrollbarTrackColor,
    '--title-color': titleColor,
    '--close-button-color': closeButtonColor,
    '--close-button-hover-color': closeButtonHoverColor,
  };
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`${styles.overlay} ${styles[`position-${position}`]} ${overlayClassName || ''}`} onClick={onClose}>
      <div className={`${styles.modal} ${styles[`animation-${animationType}`]} ${className || ''}`} style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {showHeader && (
          <div className={styles.header}>
            {title && <h2 className={styles.title}>{title}</h2>}
            <button className={styles.closeButton} onClick={onClose}>
              {customCloseIcon ? (
                customCloseIcon
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={styles.closeIcon}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        )}
        <div className={`${styles.content} w-full h-full`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
