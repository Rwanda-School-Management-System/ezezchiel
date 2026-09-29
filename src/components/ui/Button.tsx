import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl whitespace-nowrap transition-all duration-200 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4 py-2 gap-2 h-10',
    lg: 'text-base px-5 py-2.5 gap-2.5 h-12'
  };

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/20 focus-visible:ring-emerald-500',
    secondary:
      'bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/80 hover:border-slate-600 focus-visible:ring-slate-400',
    danger:
      'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-950/40 hover:from-rose-500 hover:to-red-500 focus-visible:ring-rose-500',
    success:
      'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-900/30 focus-visible:ring-emerald-500',
    outline:
      'border-2 border-emerald-500/60 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400 focus-visible:ring-emerald-500',
    ghost: 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 focus-visible:ring-slate-500'
  };

  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span className="truncate">{children}</span>
    </motion.button>
  );
};
