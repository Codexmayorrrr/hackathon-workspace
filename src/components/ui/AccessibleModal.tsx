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
import { X } from 'lucide-react';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  titleId: string;
  descriptionId?: string;
  maxWidthClass?: string;
  /** Optional structured chrome props keeping header & actions pinned cleanly. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  iconToneClass?: string;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  closeLabel?: string;
  children: React.ReactNode;
}

const SHEET_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];
const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

/**
 * Portal-rendered accessible dialog that adapts into a 1:1 draggable bottom sheet
 * below 640px and a centered dialog on desktop, with scroll lock, Escape close,
 * focus trapping/restoration, pinned header/footer chrome, and reduced-motion support.
 */
export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  titleId,
  descriptionId,
  maxWidthClass = 'max-w-2xl',
  title,
  description,
  icon,
  iconToneClass = 'bg-[#F4F4F6] text-[#18181B]',
  headerRight,
  footer,
  closeLabel = 'Close dialog',
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

  // 1:1 finger tracking offset during sheet pull-to-dismiss
  const dragY = useMotionValue(0);
  const linkedBackdropOpacity = useTransform(dragY, [0, 320], [1, 0.06]);

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

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    const shell = document.getElementById('app-shell-root');
    if (shell) {
      shell.inert = true;
    }

    const focusTimer = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const target =
        panel.querySelector<HTMLElement>(
          '[data-autofocus], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([data-sheet-close]):not([disabled]), [href]'
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
      document.documentElement.style.overflow = prevOverflow;
      if (shell) {
        shell.inert = false;
      }
      previousFocusRef.current?.focus({ preventScroll: true });
    };
  }, [isOpen, dragY]);

  const handleHeaderDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isMobileSheet) return;
    if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) {
      return;
    }
    dragControls.start(e);
  };

  const handleSheetDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isMobileSheet) return;
    const panelHeight = panelRef.current?.getBoundingClientRect().height || 400;
    const distanceThreshold = Math.min(130, panelHeight * 0.3);

    if (info.offset.y > distanceThreshold || info.velocity.y > 450) {
      onCloseRef.current();
      return;
    }

    if (shouldReduceMotion) {
      dragY.set(0);
    } else {
      animate(dragY, 0, {
        type: 'spring',
        duration: 0.4,
        bounce: 0.1,
        velocity: info.velocity.y,
      });
    }
  };

  const enterTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : isMobileSheet
    ? { duration: 0.36, ease: SHEET_EASE }
    : { duration: 0.22, ease: EASE_OUT };

  const exitTransition = shouldReduceMotion
    ? { duration: 0.01 }
    : isMobileSheet
    ? { duration: 0.22, ease: EASE_OUT }
    : { duration: 0.15, ease: EASE_OUT };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: shouldReduceMotion ? 0.01 : 0.2, ease: EASE_OUT } }}
          exit={{ opacity: 0, transition: { duration: shouldReduceMotion ? 0.01 : 0.14, ease: EASE_OUT } }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 overscroll-contain"
          onClick={() => onCloseRef.current()}
        >
          {/* Scrim linked directly to drag progress so backdrop and sheet never drift */}
          <motion.div
            aria-hidden="true"
            style={{ opacity: isMobileSheet ? linkedBackdropOpacity : 1 }}
            className="fixed inset-0 bg-neutral-950/35 backdrop-blur-sm pointer-events-none"
          />

          {/* Outer drag host separated from enter/exit transition for clean 1:1 tracking */}
          <motion.div
            drag={isMobileSheet ? 'y' : false}
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0.08, bottom: 0 }}
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
                  ? { opacity: 1, transition: enterTransition }
                  : isMobileSheet
                  ? { y: 0, transition: enterTransition }
                  : { opacity: 1, scale: 1, y: 0, transition: enterTransition }
              }
              exit={
                shouldReduceMotion
                  ? { opacity: 0, transition: exitTransition }
                  : isMobileSheet
                  ? { y: '100%', transition: exitTransition }
                  : { opacity: 0, scale: 0.97, y: 4, transition: exitTransition }
              }
              style={{ transformOrigin: isMobileSheet ? 'bottom center' : 'center' }}
              className="w-full bg-white rounded-t-[24px] sm:rounded-3xl relative max-h-[90dvh] sm:max-h-[92dvh] flex flex-col overflow-hidden focus-visible:outline-none"
            >
              {/* Drag Grabber + Pinned Sheet Header */}
              <div
                onPointerDown={handleHeaderDragStart}
                className={
                  title
                    ? 'flex-shrink-0 touch-pan-x sm:touch-auto select-none sm:select-text cursor-grab sm:cursor-auto active:cursor-grabbing sm:active:cursor-auto'
                    : 'flex-shrink-0'
                }
              >
                <div
                  onPointerDown={(e) => {
                    if (isMobileSheet) {
                      dragControls.start(e);
                    }
                  }}
                  aria-hidden="true"
                  className="sm:hidden h-8 w-full flex items-center justify-center touch-none select-none cursor-grab active:cursor-grabbing"
                >
                  <span className="w-9 h-1 rounded-full bg-neutral-300" />
                </div>

                {title && (
                  <div className="px-4 sm:px-6 pt-1 sm:pt-6 pb-3.5 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {icon && (
                        <div
                          aria-hidden="true"
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconToneClass}`}
                        >
                          {icon}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h2
                          id={titleId}
                          className="text-base sm:text-lg font-semibold text-[#18181B] leading-snug text-balance"
                        >
                          {title}
                        </h2>
                        {description && (
                          <p
                            id={descriptionId}
                            className="text-xs sm:text-[13px] text-[#52525B] leading-relaxed text-pretty mt-0.5 max-w-[60ch]"
                          >
                            {description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {headerRight}
                      <button
                        type="button"
                        data-sheet-close
                        onClick={() => onCloseRef.current()}
                        aria-label={closeLabel}
                        className="relative w-9 h-9 rounded-xl btn-tactile-ghost flex items-center justify-center flex-shrink-0 before:content-[''] before:absolute before:-inset-1"
                      >
                        <X aria-hidden="true" className="w-4 h-4 stroke-[1.75]" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Scrollable Sheet Body */}
              <div
                className={`flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y px-4 sm:px-6 ${
                  title ? 'pt-1 sm:pt-1' : 'pt-0 sm:pt-6'
                } ${
                  footer
                    ? 'pb-5 sm:pb-6'
                    : 'pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-6'
                }`}
              >
                {children}
              </div>

              {/* Pinned Safe-Area Action Footer */}
              {footer && (
                <div className="flex-shrink-0 bg-[#FAFAFC] px-4 sm:px-6 pt-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] sm:py-4">
                  {footer}
                </div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};
