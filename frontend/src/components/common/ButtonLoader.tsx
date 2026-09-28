import React from 'react';

interface ButtonLoaderProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'outline';
}

export const ButtonLoader: React.FC<ButtonLoaderProps> = ({
  isLoading = false,
  loadingText,
  children,
  className = '',
  disabled,
  variant = 'primary',
  ...props
}) => {
  let baseStyle = 'btn-interaction font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed';
  
  if (variant === 'primary') {
    baseStyle += ' bg-[#225944] hover:bg-[#184232] text-white';
  } else if (variant === 'secondary') {
    baseStyle += ' bg-[#EECA3A] hover:bg-[#E0BD2C] text-[#171A18]';
  } else if (variant === 'danger') {
    baseStyle += ' bg-rose-600 hover:bg-rose-700 text-white';
  } else if (variant === 'warning') {
    baseStyle += ' bg-amber-600 hover:bg-amber-700 text-white';
  } else if (variant === 'outline') {
    baseStyle += ' bg-white hover:bg-[#F7F5EF] text-[#171A18] border border-[#E5E1D6]';
  }

  return (
    <button
      disabled={isLoading || disabled}
      className={`${baseStyle} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
          <span>{loadingText || 'Processing...'}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default ButtonLoader;
