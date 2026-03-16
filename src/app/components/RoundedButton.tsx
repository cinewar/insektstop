import Svg from './Svg';

interface IRoundedButtonProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconSize?: number;
  className?: string;
  onClick?: () => void;
}

export function RoundedButton({
  icon,
  onClick,
  iconSize,
  className = '',
  ...props
}: IRoundedButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      {...props}
      className={`rounded-full glassy-bg p-1 shadow-custom transition hover:scale-105 active:scale-95 ${className}`}
    >
      <Svg icon={icon} size={iconSize} />
    </button>
  );
}
