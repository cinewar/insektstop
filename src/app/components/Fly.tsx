import {FLYSVG} from '../utils/svg';
import Svg from './Svg';

export function Fly() {
  return (
    <div className='w-full mx-auto '>
      <Svg
        icon={FLYSVG}
        className='w-full
              [&_g[data-testid="fly"]]:animate-fly
              [&_g[data-testid="fly"]]:origin-[50%_50%]
              [&_g[data-testid="cracks"]]:animate-crash-blow
              [&_g[data-testid="cracks"]]:origin-[52%_64%]
              [&_g[data-testid="cracks"]]:opacity-0
              [&_path#bars]:animate-bars-hit
              [&_path#bars2]:animate-bars2-hit'
      />
    </div>
  );
}
