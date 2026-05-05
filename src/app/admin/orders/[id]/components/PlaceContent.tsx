'use client';

import {AccordionWrapper} from '@/app/components/AccordionWrapper';
import {EnlargedImageGalery} from '@/app/components/EnlargedImageGalery';
import Svg from '@/app/components/Svg';
import {MessageButton} from '@/app/order/[id]/components/MessageButton';
import {DOWNSVG} from '@/app/utils/svg';
import {normalizeImageUrl} from '@/lib/image-url';
import {OrderProductWithProducts} from '@/lib/prisma-types';
import Image from 'next/image';
import {useState, useEffect, useCallback, useRef} from 'react';
import {Message} from '../../../../../../generated/prisma';
import {MessageModal} from '@/app/order/[id]/components/MessageModal';
import {usePathname} from 'next/navigation';
import {getMessages} from '../action';

interface PlaceContentProps {
  items: OrderProductWithProducts[];
  orderId: string;
  messages: Message[];
}

type TitleProps = {
  orderItem: OrderProductWithProducts;
  isOpen?: boolean;
};

const Title: React.FC<TitleProps> = ({orderItem, isOpen}) => {
  return (
    <>
      <div className='relative w-full flex items-center justify-between '>
        {!isOpen && orderItem.price !== undefined && (
          <div className='absolute -bottom-3 left-0 text-sm text-tertiary font-semibold'>
            £{orderItem.price.toFixed(2)}
          </div>
        )}
        <div className='font-bold text-dark-text'>{orderItem.name}</div>
        <Svg
          icon={DOWNSVG}
          size={40}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>
    </>
  );
};

const Content = ({
  orderItem,
  handleEnlargedGallery,
}: {
  orderItem: OrderProductWithProducts;
  handleEnlargedGallery: (images: string[], currentIndex: number) => void;
}) => {
  const defaultImages = [
    '/placeholder.png',
    '/placeholder.png',
    '/placeholder.png',
  ];
  return (
    <div className='flex mt-2 flex-col gap-2'>
      {orderItem.products.map((productLink) => (
        <div
          key={productLink.id}
          className='relative flex flex-col pb-2 shadow-[inset_0_0_10px_rgba(255,71,249,0.45)] bg-white
                  rounded-lg'
        >
          <div className='flex px-2 text-secondary font-semibold bg-gray rounded-t-lg'>
            <span className='flex-3'>Produkt</span>
            <span className='flex-1'>Breite(cm)</span>
            <span className='flex-1'>Länge(cm)</span>
          </div>
          <div className='p-1 flex flex-col gap-2'>
            <div className='grid grid-cols-5 items-center px-1'>
              <span className='col-span-3'>{productLink.product.name}</span>
              <span className='col-span-1'>{productLink.width}cm</span>
              <span className='col-span-1 flex items-center gap-2'>
                {productLink.length}cm{' '}
              </span>
            </div>
            <div className='flex gap-2 p-1'>
              {[
                ...productLink.images
                  .slice(0, 3)
                  .map((image) => normalizeImageUrl(image.img)),
                ...defaultImages,
              ]
                .slice(0, 3)
                .map((imageSrc, index) => (
                  <Image
                    onClick={() => {
                      if (imageSrc === '/placeholder.png') return;
                      handleEnlargedGallery(
                        productLink.images.map((image) =>
                          normalizeImageUrl(image.img),
                        ),
                        index,
                      );
                    }}
                    key={`${productLink.id}-${index}`}
                    src={imageSrc || '/placeholder.png'}
                    alt={productLink.product.name}
                    width={200}
                    height={200}
                    className='aspect-square min-w-0 flex-1 object-cover rounded-lg shadow-lg'
                  />
                ))}
            </div>
            <span
              className='bg-gray max-w-max py-1 px-3 text-secondary text-base rounded-full
                        font-semibold ml-1'
            >
              Preis: £{productLink.product.price.toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export function AdminPlaceContent({
  items,
  orderId,
  messages: initialMessages,
}: PlaceContentProps) {
  const path = usePathname();
  const [showMessages, setShowMessages] = useState(false);
  const [messageList, setMessageList] = useState<Message[]>(initialMessages);
  const evtSourceRef = useRef<EventSource | null>(null);

  // Fetch messages from API
  const syncMessagesFromDb = useCallback(async () => {
    if (!orderId) return;
    try {
      const response = await getMessages(orderId);
      if (!response.ok) return;
      const payload = response.data as Array<Message & {createdAt: string}>;

      const normalized = payload.map((message) => ({
        ...message,
        createdAt: new Date(message.createdAt),
      }));
      setMessageList(() => {
        return normalized;
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          'Bestellnachrichten konnten nicht vom Server synchronisiert werden.',
          error,
        );
      }
    }
  }, [orderId]);

  // SSE subscription for real-time updates
  useEffect(() => {
    if (!orderId) return;
    // Only one EventSource per component
    if (evtSourceRef.current) {
      evtSourceRef.current.close();
    }
    const evtSource = new EventSource(`/api/sse`);
    evtSource.addEventListener('message', () => {
      void syncMessagesFromDb();
    });
    evtSourceRef.current = evtSource;
    return () => {
      evtSource.removeEventListener('message', () => void 0);
      evtSource.close();
      evtSourceRef.current = null;
    };
  }, [orderId, syncMessagesFromDb]);

  // Also sync on mount
  useEffect(() => {
    syncMessagesFromDb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadMessageCount = messageList.filter((message) => {
    if (path.includes('admin')) {
      return message.creator === 'Customer' && !message.read;
    } else {
      return message.creator === 'Admin' && !message.read;
    }
  }).length;

  function handleOpenMessages() {
    setShowMessages(true);
  }

  const [enlargedGallery, setEnlargedGallery] = useState<{
    images: string[];
    currentIndex: number;
  } | null>(null);
  function handleEnlargedGallery(images: string[], currentIndex: number) {
    setEnlargedGallery({images, currentIndex});
  }

  const accordionItems = items.map((item) => ({
    id: item.id,
    title: (isOpen: boolean) => <Title orderItem={item} isOpen={isOpen} />,
    content: () => (
      <Content orderItem={item} handleEnlargedGallery={handleEnlargedGallery} />
    ),
  }));
  return (
    <>
      <div className='flex w-full flex-col pb-20'>
        <AccordionWrapper items={accordionItems} />
      </div>
      {enlargedGallery && (
        <EnlargedImageGalery
          images={enlargedGallery.images}
          onCloseAction={() => setEnlargedGallery(null)}
          currentIndex={enlargedGallery.currentIndex}
        />
      )}
      <MessageButton
        count={showMessages ? 0 : unreadMessageCount}
        onClickAction={handleOpenMessages}
      />

      {showMessages && (
        <MessageModal
          type='admin'
          orderId={orderId}
          messages={messageList}
          onMessagesChange={setMessageList}
          onClose={() => setShowMessages(false)}
        />
      )}
    </>
  );
}
