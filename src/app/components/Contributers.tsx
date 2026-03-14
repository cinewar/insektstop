import {ADSVG, ALSVG, CPSVG, FRSVG, RP1SVG, RPSVG} from '../utils/svg';
import Svg from './Svg';

export function Contributers() {
  const contributers = [
    ADSVG,
    ALSVG,
    CPSVG,
    FRSVG,
    RPSVG,
    RP1SVG,
    ADSVG,
    ALSVG,
    CPSVG,
    FRSVG,
    RPSVG,
    RP1SVG,
  ];
  return (
    <div
      className='relative my-3 gap-4 before:[content:""] 
                before:absolute before:top-0 before:left-0 before:w-20 before:h-full 
                before:bg-linear-to-r before:from-secondary 
                before:from-10% before:to-[rgba(255, 255, 240, 0.52)] before:to-100% before:z-10
                after:absolute after:top-0 after:right-0 after:w-20 after:h-full
                after:bg-linear-to-l after:from-secondary 
                after:from-10% after:to-[rgba(255, 255, 240, 0.52)] after:to-100% after:z-10
                overflow-hidden
                
    '
    >
      <div className='flex w-max no-scrollbar gap-4 animate-scroll'>
        {contributers.map((icon, index) => (
          <p key={index}>
            <Svg icon={icon} size={60} className='mx-2' />
          </p>
        ))}
      </div>
    </div>
  );
}
