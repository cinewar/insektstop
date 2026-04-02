'use client';

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  onClick,
  children,
  className,
  type = 'button',
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`relative inline-flex cursor-pointer px-4 py-2 min-w-30 bg-primary text-white text-lg font-medium rounded-[100vw]
         shadow-md hover:bg-tertiary z-2 ${className}
         `}
    >
      {children}
    </button>
  );
}
