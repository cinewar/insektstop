'use client';

import {useState} from 'react';
import Svg from '../components/Svg';
import {
  CONTACTSCENESVG,
  COPIEDSVG,
  COPYSVG,
  EMAILSVG,
  MAPSVG,
  PHONESVG,
  WHATSUPSVG,
} from '../utils/svg';
import {User} from '../../../generated/prisma';

interface ContactContentProps {
  user: User;
}

export function ContactContent({user}: ContactContentProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const contactItems = [
    {
      key: 'map',
      icon: MAPSVG,
      text: user.address ? user.address : 'Adres bilgisi bulunamadı',
      iconClassName: 'inline-block min-w-10 mr-2',
      textClassName: 'text-dark-text leading-tight',
    },
    {
      key: 'phone',
      icon: PHONESVG,
      text: user.phone ? user.phone : 'Telefon bilgisi bulunamadı',
      iconClassName: 'inline-block mr-2',
      textClassName: 'text-dark-text',
    },
    {
      key: 'whatsapp',
      icon: WHATSUPSVG,
      text: user.phone ? user.phone : 'WhatsApp bilgisi bulunamadı',
      iconClassName: 'inline-block mr-2',
      textClassName: 'text-dark-text',
    },
    {
      key: 'email',
      icon: EMAILSVG,
      text: user.email ? user.email : 'Email bilgisi bulunamadı',
      iconClassName: 'inline-block mr-2',
      textClassName: 'text-dark-text',
    },
  ] as const;

  const handleCopy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(
        () => setCopiedKey((current) => (current === key ? null : current)),
        1300,
      );
    } catch {
      setCopiedKey(null);
    }
  };

  return (
    <div className='min-h-screen flex flex-col bg-secondary'>
      <div className='p-2'>
        <div
          className='text-md font-medium mt-20 bg-white w-full flex flex-col gap-0 justify-between 
              rounded-lg p-3 shadow-[inset_0_0_10px_rgba(255,71,249,0.45)]'
        >
          {contactItems.map((item) => (
            <div
              key={item.key}
              className='flex justify-between rounded-xl py-1.5 hover:bg-white/35 transition-colors'
            >
              <div className='flex w-full sm:w-2/3 items-center justify-between min-w-0'>
                <div className='flex items-center min-w-0'>
                  <Svg
                    icon={item.icon}
                    size={40}
                    className={item.iconClassName}
                  />
                  <span className={item.textClassName}>{item.text}</span>
                </div>
                {copiedKey === item.key ? (
                  <Svg
                    icon={COPIEDSVG}
                    size={40}
                    className='shrink-0 text-xs font-semibold text-green-500'
                    aria-label={`${item.key} panoya kopyalandı`}
                  />
                ) : (
                  <Svg
                    icon={COPYSVG}
                    size={40}
                    onClick={() => handleCopy(item.text, item.key)}
                    className='sm:cursor-pointer shrink-0 text-xs font-semibold text-dark-text/60'
                    aria-label={`${item.key} panoya kopyala`}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <Svg
          icon={CONTACTSCENESVG}
          size={400}
          className='w-full contact-scene-buzz [&_path[data-testid^="fly-"]]:animate-buzz'
        />
      </div>
    </div>
  );
}
