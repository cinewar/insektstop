interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({children, className, onClick}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-tertiary min-w-45 p-1 text-white shadow-lg rounded-xl ${className}`}
    >
      {children}
    </div>
  );
}
