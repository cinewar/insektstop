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

export default function Contact() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const contactItems = [
    {
      key: 'map',
      icon: MAPSVG,
      text: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo, minima!',
      iconClassName: 'inline-block min-w-10 mr-2',
      textClassName: 'text-dark-text leading-tight',
    },
    {
      key: 'phone',
      icon: PHONESVG,
      text: '+1 (555) 123-4567',
      iconClassName: 'inline-block mr-2',
      textClassName: 'text-dark-text',
    },
    {
      key: 'whatsapp',
      icon: WHATSUPSVG,
      text: '+1 (555) 123-4567',
      iconClassName: 'inline-block mr-2',
      textClassName: 'text-dark-text',
    },
    {
      key: 'email',
      icon: EMAILSVG,
      text: 'info@example.com',
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
      <div className='fixed h-25 px-3 flex shadow-md items-end w-full bg-secondary'>
        <h1 className='text-2xl font-bold text-dark-text'>Contact Us</h1>
      </div>
      <div className='flex text-md font-medium flex-col gap-2 mt-32 px-2'>
        {contactItems.map((item) => (
          <div
            key={item.key}
            className='flex items-start justify-between gap-3 rounded-xl py-1.5 hover:bg-white/35 transition-colors'
          >
            <div className='flex w-full items-center justify-between min-w-0'>
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
                  aria-label={`${item.key} copied to clipboard`}
                />
              ) : (
                <Svg
                  icon={COPYSVG}
                  size={40}
                  onClick={() => handleCopy(item.text, item.key)}
                  className='shrink-0 text-xs font-semibold text-dark-text/60'
                  aria-label={`Copy ${item.key} to clipboard`}
                />
              )}
              {/* <button
                type='button'
                onClick={() => handleCopy(item.text, item.key)}
                className='shrink-0 text-xs font-semibold text-dark-text border border-tertiary/60 rounded-full px-3 py-1 hover:bg-tertiary/25 transition-colors'
                aria-label={`Copy ${item.key} to clipboard`}
              >
                {copiedKey === item.key ? 'Copied' : 'Copy'}
              </button> */}
            </div>
          </div>
        ))}
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
