'use client';

import {useState} from 'react';
import {GlassyButton} from './GlassyButton';
import {
  CLOSESVG,
  EMAILSVG,
  PHONEINFOSVG,
  PHONESVG,
  WHATSUPSVG,
} from '../utils/svg';
import Svg from './Svg';

/**
 * Describes behavior for ContactButtons.
 * Usage: Call ContactButtons(...) where this declaration is needed in the current module flow.
 */
export function ContactButtons() {
  const [openMenu, setOpenMenu] = useState(false);

  const emailAddress = 'sevinc65semih@gmail.com';
  const phoneNumber = '+905380600694';
  const whatsAppNumber = '+905380600694';

  const handleEmailClick = () => {
    const subject = encodeURIComponent('Merhaba');
    const body = encodeURIComponent(
      'Insektstop icin sizinle iletişime gecmek istiyorum.',
    );

    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${emailAddress}&su=${subject}&body=${body}`,
      '_blank',
    );
    setOpenMenu(false);
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      'Merhaba, Insektstop icin sizinle iletişime gecmek istiyorum.',
    );

    window.open(`https://wa.me/${whatsAppNumber}?text=${message}`, '_blank');
    setOpenMenu(false);
  };

  const handlePhoneClick = () => {
    window.location.href = `tel:${phoneNumber}`;
    setOpenMenu(false);
  };

  return (
    <div className='fixed sm:hidden right-4 bottom-4 z-40'>
      <ul
        id='quick-contact-menu'
        aria-label='Hizli iletişim menusu'
        className={`absolute right-0 bottom-14 flex flex-col gap-2 rounded-[100vw] border border-dark-text/10 bg-secondary/50
              py-1 shadow-custom backdrop-blur-sm transition-all origin-bottom duration-200 ${
                openMenu
                  ? 'scale-y-100 delay-0 pointer-events-auto'
                  : 'scale-y-0 delay-500 pointer-events-none'
              }`}
      >
        <li className='mx-auto'>
          <Svg
            className='active:scale-95'
            icon={CLOSESVG}
            onClick={() => setOpenMenu(!openMenu)}
            size={32}
          />
        </li>
        <li>
          <GlassyButton
            icon={EMAILSVG}
            iconSize={45}
            className={`${openMenu ? 'delay-100 scale-100' : 'delay-300 scale-0'}`}
            onClick={handleEmailClick}
          />
        </li>
        <li>
          <GlassyButton
            icon={WHATSUPSVG}
            iconSize={45}
            className={`${openMenu ? 'delay-200 scale-100' : 'delay-200 scale-0'}`}
            onClick={handleWhatsAppClick}
          />
        </li>
        <li>
          <GlassyButton
            icon={PHONESVG}
            iconSize={45}
            className={`${openMenu ? 'delay-300 scale-100' : 'delay-100 scale-0'}`}
            onClick={handlePhoneClick}
          />
        </li>
      </ul>

      {!openMenu && (
        <GlassyButton
          icon={PHONEINFOSVG}
          iconSize={45}
          onClick={() => setOpenMenu(!openMenu)}
        />
      )}
    </div>
  );
}
