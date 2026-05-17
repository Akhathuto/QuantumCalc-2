import type { ReactNode } from 'react';

interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  title?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'clear' | 'num';
}

const Button = ({ onClick, children, className = '', ariaLabel, title, variant = 'outline' }: ButtonProps) => {
  const variants = {
    primary: 'bg-brand-primary text-brand-bg shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90',
    secondary: 'bg-brand-secondary text-white shadow-lg shadow-brand-secondary/20 hover:bg-orange-500',
    outline: 'bg-brand-surface border border-brand-border/50 hover:bg-brand-border text-brand-text-secondary',
    ghost: 'bg-transparent hover:bg-brand-surface text-brand-text-secondary',
    clear: 'bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20',
    num: 'bg-brand-surface/40 hover:bg-brand-surface text-brand-text font-bold border border-brand-border/30',
  };

  const baseClasses = "flex items-center justify-center p-4 rounded-2xl text-xl font-bold focus:outline-none transition-all transform active:scale-95 duration-200";
  
  return (
    <button 
      onClick={onClick} 
      className={`${baseClasses} ${variants[variant as keyof typeof variants] || ''} ${className}`} 
      aria-label={ariaLabel || (typeof children === 'string' ? children : '')} 
      title={title}
    >
      {children}
    </button>
  );
};

export default Button;