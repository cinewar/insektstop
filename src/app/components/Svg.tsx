import {SVGProps, ComponentType} from 'react';

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
