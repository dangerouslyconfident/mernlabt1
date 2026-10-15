import { memo } from 'react';

/**
 * Apple-style Glassmorphism Card Component
 * Strictly uses design tokens: translucent fill, 1px subtle border,
 * isolated backdrop blur layer, faint top inner highlight, and soft large shadow.
 * 
 * Performance Architecture:
 * - Separates backdrop blur layer from content layer into dedicated sub-surfaces.
 * - Forces GPU hardware layer composition via `gpu-layer` and `blur-isolation`.
 * - Prevents compositor tile invalidation and repaint flickering during transforms.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.className] - Additional classes
 * @param {boolean} [props.hoverLift=false] - Subtle scale/elevation lift on hover
 * @param {'none'|'sm'|'default'|'lg'|'xl'} [props.padding='default'] - Card padding
 * @param {'default'|'elevated'|'subtle'} [props.variant='default'] - Depth variant
 */
function GlassCardComponent({
  children,
  className = '',
  hoverLift = false,
  hoverable = false, // Backwards compatibility with existing Lab code
  padding = 'default',
  variant = 'default',
  ...props
}) {
  const shouldLift = hoverLift || hoverable;

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    default: 'p-6 sm:p-8',
    lg: 'p-8 sm:p-10',
    xl: 'p-10 sm:p-12',
  };

  const variantStyles = {
    default: 'bg-glass/[0.04] border-glass-border/[0.08] shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]',
    elevated: 'bg-glass/[0.07] border-glass-border/[0.14] shadow-[0_16px_48px_0_rgba(0,0,0,0.45)]',
    subtle: 'bg-glass/[0.02] border-glass-border/[0.05] shadow-[0_4px_20px_0_rgba(0,0,0,0.2)]',
  };

  const liftStyles = shouldLift
    ? 'hover:-translate-y-1 hover:border-glass-border/[0.16] hover:bg-glass/[0.06] transition-all duration-300'
    : 'transition-all duration-200';

  return (
    <div
      className={`relative rounded-3xl text-primary blur-isolation ${liftStyles} ${className}`}
      {...props}
    >
      {/* 
        ISOLATED BLUR & BACKGROUND LAYER
        Separated from content layer to prevent GPU rasterization flicker during continuous motion
      */}
      <div
        className={`pointer-events-none absolute inset-0 -z-10 rounded-3xl border backdrop-blur-xl overflow-hidden gpu-layer ${variantStyles[variant] || variantStyles.default}`}
        aria-hidden="true"
      >
        {/* Faint top inner highlight line */}
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-glass/20 to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* CONTENT LAYER: Rendered on clean z-index above the blur canvas */}
      <div className={`relative z-10 w-full ${paddingStyles[padding] || ''}`}>
        {children}
      </div>
    </div>
  );
}

const GlassCard = memo(GlassCardComponent);
export default GlassCard;
