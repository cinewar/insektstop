import Svg from './Svg';

interface IGlassyButtonProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconSize?: number;
  label?: string;
  className?: string;
  onClick?: () => void;
}

export function GlassyButton({
  icon,
  onClick,
  iconSize,
  label,
  className = '',
  ...props
}: IGlassyButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      onClick={onClick}
      {...props}
      className={`rounded-full glassy-bg p-1 shadow-custom transition 
        hover:scale-101 active:scale-95 ${className}
        flex items-center  ${label ? 'pl-4 pr-2 py-2 w-full h-12 justify-between' : 'p-1 justify-center'}
        `}
    >
      {label && <span className='text-secondary'>{label}</span>}
      <Svg icon={icon} className='text-primary' size={iconSize} />
    </button>
  );
}
