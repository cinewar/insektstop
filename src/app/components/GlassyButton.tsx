import Svg from './Svg';

/**
 * Defines the IGlassyButtonProps interface.
 * Usage: Implement or consume IGlassyButtonProps when exchanging this structured contract.
 */
interface IGlassyButtonProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconSize?: number;
  label?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * Describes behavior for GlassyButton.
 * Usage: Call GlassyButton(...) where this declaration is needed in the current module flow.
 */
export function GlassyButton({
  icon,
  onClick,
  iconSize,
  label,
  className = '',
  type,
  ...props
}: IGlassyButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type ?? 'button'}
      onClick={onClick}
      {...props}
      className={`rounded-full glassy-bg p-1 shadow-custom sm:cursor-pointer transition 
        hover:scale-101 active:scale-95 ${className}
        flex items-center  ${label ? 'pl-4 pr-2 py-2 h-12 justify-between' : 'p-1 justify-center'}
        `}
    >
      {label && <span className='text-secondary'>{label}</span>}
      <Svg icon={icon} className='text-primary' size={iconSize} />
    </button>
  );
}
