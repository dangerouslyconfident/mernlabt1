import { useEffect, useRef, useState } from 'react';
import { useWishlist } from '../../context/WishlistContext';

/**
 * Premium Apple-Grade Undo Toast
 * 
 * Features:
 * - Positioned at bottom center
 * - Auto-dismisses in 5s; pauses while hovered
 * - Replaces previous toast instantly
 * - Single Undo action button with high contrast
 * - Accessible with role="status" and aria-live="polite"
 */
export default function UndoToast() {
  const { toast, dismissToast } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const remainingTimeRef = useRef(5000);
  const startTimeRef = useRef(null);
  const timeoutIdRef = useRef(null);

  useEffect(() => {
    if (!toast) return;

    remainingTimeRef.current = 5000;
    startTimeRef.current = Date.now();

    const startTimer = (duration) => {
      timeoutIdRef.current = setTimeout(() => {
        dismissToast();
      }, duration);
    };

    if (!isHovered) {
      startTimer(remainingTimeRef.current);
    }

    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [toast, isHovered, dismissToast]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (timeoutIdRef.current && startTimeRef.current) {
      clearTimeout(timeoutIdRef.current);
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(1000, remainingTimeRef.current - elapsed);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    startTimeRef.current = Date.now();
    timeoutIdRef.current = setTimeout(() => {
      dismissToast();
    }, remainingTimeRef.current);
  };

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 inset-x-0 z-50 flex justify-center pointer-events-none px-4"
    >
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="pointer-events-auto max-w-md rounded-full bg-bg/95 backdrop-blur-2xl border border-glass-border/[0.16] px-5 py-2.5 shadow-[0_16px_40px_rgba(0,0,0,0.6)] flex items-center justify-between gap-4 text-xs font-medium text-primary animate-in fade-in slide-in-from-bottom-4 duration-200"
      >
        <span className="truncate">{toast.message}</span>

        {toast.onUndo && (
          <button
            type="button"
            onClick={toast.onUndo}
            className="text-xs font-semibold text-accent hover:text-white px-2.5 py-1 rounded-full bg-accent/15 hover:bg-accent/30 border border-accent/30 transition-all cursor-pointer select-none active:scale-95 shrink-0"
          >
            Undo
          </button>
        )}
      </div>
    </div>
  );
}
