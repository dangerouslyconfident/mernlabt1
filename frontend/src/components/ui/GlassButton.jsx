/**
 * Apple-style Pill Glassmorphism Button Component
 * Supports polymorphic rendering (as={Link} or native <button>),
 * variants (primary, glass, ghost), loading spinner, and keyboard focus states.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button label / content
 * @param {'primary'|'glass'|'secondary'|'ghost'|'danger'} [props.variant='glass'] - Style variant
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Button size
 * @param {boolean} [props.isLoading=false] - Loading spinner state
 * @param {React.ReactNode} [props.icon] - Optional icon
 * @param {React.ElementType} [props.as='button'] - Polymorphic tag or component (e.g. Link)
 * @param {string} [props.className] - Additional classes
 * @param {boolean} [props.disabled=false] - Disabled state
 */
export default function GlassButton({
  children,
  variant = 'glass',
  size = 'md',
  isLoading = false,
  icon,
  as: Component = 'button',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) {
  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-7 py-3.5 gap-2.5 font-medium',
  };

  const variantStyles = {
    primary:
      'bg-primary text-bg font-semibold hover:opacity-90 border border-transparent shadow-[0_4px_24px_rgba(var(--glass)/0.2)]',
    glass:
      'bg-glass/[0.08] hover:bg-glass/[0.14] text-primary border border-glass-border/[0.14] backdrop-blur-md shadow-sm',
    secondary:
      'bg-glass/[0.08] hover:bg-glass/[0.14] text-primary border border-glass-border/[0.14] backdrop-blur-md shadow-sm',
    ghost:
      'bg-transparent hover:bg-glass/[0.06] text-muted hover:text-primary border border-transparent',
    danger:
      'bg-danger/15 hover:bg-danger/25 text-danger border border-danger/30 backdrop-blur-md',
  };

  const isDisabled = disabled || isLoading;

  const componentProps =
    Component === 'button'
      ? { type, disabled: isDisabled, ...props }
      : { ...props };

  return (
    <Component
      className={`inline-flex items-center justify-center rounded-full select-none transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.glass} ${className}`}
      {...componentProps}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </Component>
  );
}
