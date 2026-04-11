'use client';

/**
  * Defines the ButtonProps interface.
  * Usage: Implement or consume ButtonProps when exchanging this structured contract.
  */
interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

/**
  * Describes behavior for Button.
  * Usage: Call Button(...) where this declaration is needed in the current module flow.
  */
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
