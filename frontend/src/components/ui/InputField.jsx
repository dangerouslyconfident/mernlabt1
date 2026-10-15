import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Apple-style Glassmorphism Input Field Component
 * Supports accessible labels, aria-invalid, error messages,
 * and built-in password visibility toggle.
 *
 * @param {Object} props
 * @param {string} [props.label] - Field label
 * @param {string} [props.error] - Validation error message
 * @param {string} [props.helperText] - Supporting helper text
 * @param {React.ReactNode} [props.leftIcon] - Left interior icon
 * @param {React.ReactNode} [props.rightIcon] - Custom right interior icon
 * @param {boolean} [props.showPasswordToggle=false] - Enable password show/hide button
 * @param {string} [props.className] - Wrapper extra classes
 * @param {string} [props.inputClassName] - Input element extra classes
 * @param {string} [props.id] - Accessible identifier
 * @param {string} [props.type='text'] - Input type
 */
export default function InputField({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  className = '',
  inputClassName = '',
  id,
  type = 'text',
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const isPassword = type === 'password';
  const effectiveType = isPassword && showPassword ? 'text' : type;

  return (
    <div className={`flex flex-col gap-1.5 text-left ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium tracking-wide text-muted select-none"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-muted">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          type={effectiveType}
          aria-invalid={!!error}
          className={`w-full rounded-2xl bg-glass/[0.04] border backdrop-blur-xl px-4 py-2.5 text-sm text-primary placeholder-muted outline-none transition-all duration-200 ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon || (isPassword && showPasswordToggle) ? 'pr-10' : ''} ${
            error
              ? 'border-danger/60 focus:border-danger focus:ring-4 focus:ring-danger/15'
              : 'border-glass-border/[0.08] focus:border-accent/70 focus:bg-glass/[0.07] focus:ring-4 focus:ring-accent/15'
          } ${inputClassName}`}
          {...props}
        />

        {/* Password toggle button or custom right icon */}
        {isPassword && showPasswordToggle ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 flex items-center text-muted hover:text-primary transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        ) : (
          rightIcon && (
            <div className="absolute right-3.5 flex items-center text-muted">
              {rightIcon}
            </div>
          )
        )}
      </div>

      {error ? (
        <p className="text-xs text-danger flex items-center gap-1.5 mt-0.5" role="alert">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-muted mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
}
