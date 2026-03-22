'use client';

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Button({onClick, children, className}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative cursor-pointer px-4 py-2 min-w-30 bg-primary text-white text-lg font-medium rounded-[100vw]
         shadow-md hover:bg-tertiary z-2 ${className}
         `}
    >
      {children}
    </button>
  );
}
