import { ReactNode } from "react";
import { clsx } from "clsx";

/**
 * Card Component
 * 
 * A container component for grouping related content.
 */

export interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export function Card({
  children,
  className,
  padding = "md",
  shadow = "md",
  hover = false,
}: CardProps) {
  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-6",
    lg: "p-8",
  };

  const shadowStyles = {
    none: "",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  return (
    <div
      className={clsx(
        "bg-white rounded-xl border border-gray-200",
        paddingStyles[padding],
        shadowStyles[shadow],
        hover && "transition-shadow duration-200 hover:shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}

// Card Header
export interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={clsx("mb-4 pb-4 border-b border-gray-200", className)}>
      {children}
    </div>
  );
}

// Card Title
export interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={clsx("text-xl font-semibold text-gray-900", className)}>
      {children}
    </h3>
  );
}

// Card Description
export interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={clsx("text-sm text-gray-500 mt-1", className)}>
      {children}
    </p>
  );
}

// Card Content
export interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={clsx("", className)}>{children}</div>;
}

// Card Footer
export interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={clsx("mt-4 pt-4 border-t border-gray-200", className)}>
      {children}
    </div>
  );
}
