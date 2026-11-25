import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  animate,
  AnimatePresence,
  motion,
  PanInfo,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleId: string;
  descriptionId?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}

const SHEET_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

/**
 * Portal-rendered accessible dialog that renders as a 1:1 draggable bottom sheet
 * on mobile viewports (<640px) and a centered dialog on desktop, with Escape close,
 * focus trapping/restoration, inert background isolation, and reduced-motion support.
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
  const dragControls = useDragControls();

  const [isMobileSheet, setIsMobileSheet] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 639px)').matches : false
  );

  // 1:1 finger tracking offset during sheet pull-to-dismiss; never eases mid-drag
  const dragY = useMotionValue(0);
  const linkedBackdropOpacity = useTransform(dragY, [0, 300], [1, 0.08]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 639px)');
    const handleChange = (e: MediaQueryListEvent) => setIsMobileSheet(e.matches);
    setIsMobileSheet(mq.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    dragY.set(0);
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
  }, [isOpen, dragY]);

  const handleSheetDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isMobileSheet) return;
    const panelHeight = panelRef.current?.getBoundingClientRect().height || 400;
    const distanceThreshold = Math.min(140, panelHeight * 0.35);

    if (info.offset.y > distanceThreshold || info.velocity.y > 500) {
      onCloseRef.current();
      return;
    }

    if (shouldReduceMotion) {
      dragY.set(0);
    } else {
      animate(dragY, 0, {
        type: 'spring',
        duration: 0.42,
        bounce: 0.14,
        velocity: info.velocity.y,
      });
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: SHEET_EASE }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overscroll-contain"
          onClick={() => onCloseRef.current()}
        >
          {/* Scrim linked directly to drag progress so backdrop and sheet never drift */}
          <motion.div
            aria-hidden="true"
            style={{ opacity: isMobileSheet ? linkedBackdropOpacity : 1 }}
            className="fixed inset-0 bg-neutral-950/35 backdrop-blur-sm pointer-events-none"
          />

          {/* Outer interactive drag layer (separated from enter/exit transform for clean 1:1 tracking) */}
          <motion.div
            drag={isMobileSheet ? 'y' : false}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0.12, bottom: 0.22 }}
            dragMomentum={false}
            onDragEnd={handleSheetDragEnd}
            style={{ y: isMobileSheet ? dragY : 0 }}
            className={`relative z-10 w-full ${maxWidthClass} pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-0`}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              tabIndex={-1}
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : isMobileSheet
                  ? { y: '100%' }
                  : { opacity: 0, scale: 0.96, y: 8 }
              }
              animate={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : isMobileSheet
                  ? { y: 0 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : isMobileSheet
                  ? { y: '100%' }
                  : { opacity: 0, scale: 0.96, y: 6 }
              }
              transition={
                shouldReduceMotion
                  ? { duration: 0.01 }
                  : isMobileSheet
                  ? { duration: 0.36, ease: SHEET_EASE }
                  : { duration: 0.2, ease: [0.23, 1, 0.32, 1] }
              }
              style={{ transformOrigin: isMobileSheet ? 'bottom center' : 'center' }}
              className="w-full bg-white rounded-t-3xl sm:rounded-2xl relative max-h-[90dvh] sm:max-h-[92dvh] flex flex-col overflow-hidden shadow-dialog focus-visible:outline-none"
            >
              {/* Mobile 44px touch-none drag handle strip */}
              <div
                onPointerDown={(e) => {
                  if (isMobileSheet) {
                    dragControls.start(e);
                  }
                }}
                aria-hidden="true"
                className="sm:hidden h-11 w-full flex items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing flex-shrink-0"
              >
                <span className="w-10 h-1 rounded-full bg-neutral-300" />
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-0 sm:p-8">
                {children}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};
