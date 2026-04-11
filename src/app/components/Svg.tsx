import {SVGProps, ComponentType} from 'react';

/**
  * Defines the ISvgProps interface.
  * Usage: Implement or consume ISvgProps when exchanging this structured contract.
  */
interface ISvgProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  size?: number;
  className?: string;
  onClick?: () => void;
}

export default function Svg({
  className = '',
  icon: IconComponent,
  onClick,
  size = 24,
  ...props
}: ISvgProps) {
  return (
    <IconComponent
      onClick={onClick}
      className={className}
      width={size}
      {...props}
    />
  );
}
