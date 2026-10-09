import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import './SlideCommit.css';

/**
 * SlideCommit — React Bits swipe-to-confirm pill component.
 * Adapted for AcuityFlow clinical action commitments.
 *
 * Props:
 *  label         ReactNode   Instruction text inside the pill
 *  doneLabel     string      Text shown on success
 *  errorLabel    string      Text shown on failure
 *  onConfirm     () => Promise<any> | any   Called when user slides to end
 *  onDone        () => void  Called after successful confirmation
 *  onError       (reason) => void  Called on rejection
 *  trackColor    string      Background of the track
 *  handleColor   string      Color of the draggable thumb
 *  successColor  string      Track color on success
 *  dangerColor   string      Track color on error
 *  width         number      Total pill width in px
 *  height        number      Pill height in px
 *  radius        number      Border radius
 *  speed         number      px/s for auto-complete snap snap
 *  returnBounce  number      Spring bounce on return
 *  landingDip    number      Scale dip fraction on landing
 *  holdMs        number      Hold duration on success before reset
 *  disabled      boolean     Freeze the slider
 */
export default function SlideCommit({
  label = 'Slide to confirm',
  doneLabel = 'Confirmed',
  errorLabel = 'Failed',
  onConfirm,
  onDone,
  onError,
  trackColor = '#1a1e2b',
  handleColor = '#e2e8f0',
  successColor = '#22c55e',
  dangerColor = '#e5484d',
  width = 300,
  height = 56,
  radius = 28,
  speed = 50,
  returnBounce = 0.38,
  landingDip = 0.026,
  holdMs = 1400,
  disabled = false,
}) {
  const thumbSize = height - 10; // thumb is inset by 5px each side
  const trackWidth = width - thumbSize - 10; // total travel

  const x = useMotionValue(0);
  const [phase, setPhase] = useState('idle'); // idle | dragging | loading | done | error
  const isDragging = useRef(false);
  const containerRef = useRef(null);

  // Opacity of the label fades out as thumb moves right
  const labelOpacity = useTransform(x, [0, trackWidth * 0.6], [1, 0]);

  // Track fill grows with x
  const fillWidth = useTransform(x, [0, trackWidth], [thumbSize + 10, width]);

  // Track fill color: success on done, danger on error, indigo otherwise
  const fillColor =
    phase === 'done' ? successColor :
    phase === 'error' ? dangerColor :
    '#4f46e5';

  const resetSlider = useCallback((bounce = returnBounce) => {
    animate(x, 0, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      bounce,
    });
    setPhase('idle');
  }, [x, returnBounce]);

  const snapToEnd = useCallback(async () => {
    setPhase('loading');
    // Snap thumb to end
    await animate(x, trackWidth, {
      type: 'spring',
      stiffness: 400,
      damping: 35,
      duration: 0.25,
    });

    // Landing dip scale pulse (visual feedback)
    try {
      const result = onConfirm ? await Promise.resolve(onConfirm()) : undefined;
      setPhase('done');
      onDone?.();
      setTimeout(() => resetSlider(0.1), holdMs);
    } catch (err) {
      setPhase('error');
      onError?.(err);
      setTimeout(() => resetSlider(returnBounce), holdMs);
    }
  }, [x, trackWidth, onConfirm, onDone, onError, holdMs, resetSlider, returnBounce]);

  // Pointer event handlers
  const handlePointerDown = (e) => {
    if (disabled || phase !== 'idle') return;
    isDragging.current = true;
    setPhase('dragging');
    containerRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current || phase === 'loading') return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const offsetX = e.clientX - rect.left - thumbSize / 2 - 5;
    const clamped = Math.max(0, Math.min(offsetX, trackWidth));
    x.set(clamped);
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const currentX = x.get();
    if (currentX >= trackWidth * 0.82) {
      snapToEnd();
    } else {
      resetSlider();
    }
  };

  // Keyboard a11y: press Enter/Space to commit
  const handleKeyDown = (e) => {
    if (disabled || phase !== 'idle') return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      snapToEnd();
    }
  };

  const thumbLabel =
    phase === 'loading' ? '⟳' :
    phase === 'done' ? '✓' :
    phase === 'error' ? '✕' :
    '→';

  const centerText =
    phase === 'done' ? doneLabel :
    phase === 'error' ? errorLabel :
    label;

  return (
    <div
      className="slide-commit-wrapper"
      style={{ width, height }}
      aria-label={typeof label === 'string' ? label : 'Slide to confirm'}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
    >
      {/* Track background */}
      <div
        className="slide-commit-track"
        style={{
          width,
          height,
          borderRadius: radius,
          background: trackColor,
        }}
      />

      {/* Fill bar */}
      <motion.div
        className="slide-commit-fill"
        style={{
          width: fillWidth,
          height,
          borderRadius: radius,
          background: fillColor,
          opacity: phase === 'idle' ? 0.18 : 0.85,
        }}
        transition={{ type: 'tween', ease: 'linear', duration: 0 }}
      />

      {/* Center label */}
      <motion.div
        className="slide-commit-label"
        style={{ opacity: labelOpacity, userSelect: 'none' }}
      >
        {centerText}
      </motion.div>

      {/* Done/Error label overlay */}
      {(phase === 'done' || phase === 'error') && (
        <div
          className="slide-commit-status"
          style={{ color: phase === 'done' ? successColor : dangerColor }}
        >
          {centerText}
        </div>
      )}

      {/* Draggable thumb */}
      <motion.div
        ref={containerRef}
        className="slide-commit-thumb"
        style={{
          x,
          width: thumbSize,
          height: thumbSize,
          borderRadius: thumbSize / 2,
          background: handleColor,
          top: 5,
          left: 5,
          cursor: disabled ? 'not-allowed' : phase === 'loading' ? 'wait' : 'grab',
          boxShadow: '0 2px 12px rgba(0,0,0,0.45)',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        whileHover={phase === 'idle' && !disabled ? { scale: 1.06 } : {}}
        whileTap={phase === 'idle' && !disabled ? { scale: 0.94 } : {}}
        animate={
          phase === 'loading'
            ? { scale: [1, 1 - landingDip, 1], transition: { duration: 0.3, repeat: Infinity } }
            : {}
        }
      >
        <span className="slide-commit-thumb-icon">{thumbLabel}</span>
      </motion.div>
    </div>
  );
}
