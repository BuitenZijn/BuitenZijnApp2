import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

/**
 * Input Component
 * 
 * A styled input component with label and error state support.
 */

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {props.required && <span className="text-rust-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            "w-full px-4 py-2 rounded-lg border transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-0",
            "placeholder:text-gray-400",
            error
              ? "border-rust-500 focus:border-rust-500 focus:ring-rust-200"
              : "border-gray-300 focus:border-green-500 focus:ring-green-200",
            "disabled:bg-gray-100 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-rust-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
