import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleId: string;
  descriptionId?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}

/**
 * Portal-rendered accessible dialog handling Escape close, focus trapping/restoration,
 * background inertness on #app-shell-root, overscroll containment, and reduced-motion alignment.
 */
export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  titleId,
  descriptionId,
  maxWidthClass = 'max-w-2xl',
  children,
}) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const shell = document.getElementById('app-shell-root');
    if (shell) {
      shell.inert = true;
    }

    const focusTimer = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const target =
        panel.querySelector<HTMLElement>(
          '[data-autofocus], input:not([disabled]), textarea:not([disabled]), button:not([disabled]), [href], select:not([disabled])'
        ) || panel;
      target.focus({ preventScroll: true });
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
      } else if (e.key === 'Tab' && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);

        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      if (shell) {
        shell.inert = false;
      }
      previousFocusRef.current?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.16, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/35 backdrop-blur-sm overscroll-contain"
          onClick={() => onCloseRef.current()}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.2, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: 'center' }}
            className={`w-full ${maxWidthClass} bg-white rounded-2xl relative max-h-[92vh] flex flex-col overflow-hidden shadow-dialog focus-visible:outline-none`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-y-auto overscroll-contain p-5 sm:p-8">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};
