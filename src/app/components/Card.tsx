/**
 * Defines the CardProps interface.
 * Usage: Implement or consume CardProps when exchanging this structured contract.
 */
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * Describes behavior for Card.
 * Usage: Call Card(...) where this declaration is needed in the current module flow.
 */
export function Card({children, className, onClick}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`min-w-45 sm:min-w-55 p-1 text-white shadow-lg rounded-xl ${className}`}
    >
      {children}
    </div>
  );
}
