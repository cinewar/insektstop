interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({children, className}: CardProps) {
  return (
    <div
      className={`bg-tertiary min-w-45 p-1 shadow-lg rounded-xl ${className}`}
    >
      {children}
    </div>
  );
}
