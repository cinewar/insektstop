'use client';

import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import Svg from '@/app/components/Svg';
import {ADDPHOTOSVG, CLOSESVG, SENDSVG} from '@/app/utils/svg';
import {Message} from '../../../../../generated/prisma';
import {Input} from '@/app/components/Input';
import {GlassyButton} from '@/app/components/GlassyButton';
import {markOrderMessagesAsRead, sendMessageToOrder} from '../action';
import Image from 'next/image';
import {EnlargedImageGalery} from '@/app/components/EnlargedImageGalery';

interface MessageModalProps {
  /** Closes the modal (with existing close animation flow). */
  onClose: () => void;
  /** Initial message snapshot when modal is opened. */
  messages?: Message[];
  /** Order id used by send/read server actions and SSE channel. */
  orderId?: string;
  /** Pushes local message state changes back to parent for badge/count sync. */
  onMessagesChange?: (messages: Message[]) => void;
}

export function MessageModal({
  onClose,
  messages,
  orderId,
  onMessagesChange,
}: MessageModalProps) {
  const [enlargedImageUrl, setEnlargedImageUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState({
    content: '',
    image: null as File | null,
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  /** Reads selected image file and prepares local preview URL. */
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setValues((prev) => ({...prev, image: file}));
    setImagePreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  /** Clears selected upload image and revokes preview object URL. */
  function clearImage() {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setValues((prev) => ({...prev, image: null}));
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }
  const [messageList, setMessageList] = useState<Message[]>(messages ?? []);
  const messageListRef = useRef<HTMLDivElement>(null);
  const shouldScrollToLatestRef = useRef(false);
  const hasScrolledOnOpenRef = useRef(false);

  /** Scroll helper that moves viewport to latest message. */
  function scrollToLatestMessage() {
    const container = messageListRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth',
    });

    // Fallback pass for cases where layout settles after the smooth scroll starts.
    setTimeout(() => {
      if (!messageListRef.current) {
        return;
      }

      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }, 120);
  }

  /** Text input state handler for outgoing message content. */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues((prev) => ({...prev, content: e.target.value}));
  }
  const [isClosing, setIsClosing] = useState(false);

  /** Starts close animation; actual unmount is handled on animation end. */
  function close() {
    setIsClosing(true);
  }

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
    // Only run on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isClosing) {
      return;
    }

    onMessagesChange?.(messageList);
  }, [messageList, onMessagesChange, isClosing]);

  useLayoutEffect(() => {
    if (!hasScrolledOnOpenRef.current) {
      requestAnimationFrame(() => {
        scrollToLatestMessage();
      });
      hasScrolledOnOpenRef.current = true;
      return;
    }

    if (!shouldScrollToLatestRef.current) {
      return;
    }

    requestAnimationFrame(() => {
      scrollToLatestMessage();
      shouldScrollToLatestRef.current = false;
    });
  }, [messageList.length]);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    const syncReadState = async () => {
      const result = await markOrderMessagesAsRead(orderId);
      if (!result.ok || result.data.length === 0) {
        return;
      }

      const ids = new Set(result.data);
      setMessageList((prev) =>
        prev.map((message) =>
          ids.has(message.id) ? {...message, read: true} : message,
        ),
      );

      // Force local unread reset so badge clears even if SSE delivery is delayed.
      setMessageList((prev) =>
        prev.map((message) => ({...message, read: true})),
      );
    };

    const syncMessagesFromDb = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}/messages`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          ok: boolean;
          data?: Array<Message & {createdAt: string}>;
        };

        if (!payload.ok || !payload.data) {
          return;
        }

        const normalized = payload.data.map((message) => ({
          ...message,
          createdAt: new Date(message.createdAt),
        }));

        setMessageList((prev) => {
          const hasNewMessage = normalized.some(
            (message) => !prev.some((existing) => existing.id === message.id),
          );

          if (hasNewMessage) {
            shouldScrollToLatestRef.current = true;
          }

          return normalized;
        });
      } catch {
        // Polling fallback is best-effort; ignore intermittent network errors.
      }
    };

    void syncReadState();
    void syncMessagesFromDb();

    const pollInterval = setInterval(() => {
      void syncMessagesFromDb();
    }, 2500);

    const stream = new EventSource(`/api/orders/${orderId}/messages/stream`);

    const handleMessageCreated = (event: MessageEvent) => {
      const incoming = JSON.parse(event.data) as Message & {createdAt: string};
      const normalizedMessage: Message = {
        ...incoming,
        createdAt: new Date(incoming.createdAt),
      };

      setMessageList((prev) => {
        if (prev.some((item) => item.id === normalizedMessage.id)) {
          return prev;
        }

        shouldScrollToLatestRef.current = true;
        return [...prev, normalizedMessage];
      });

      // Mark newly arrived messages as read when chat is already open.
      void syncReadState();
    };

    const handleMessageRead = (event: MessageEvent) => {
      const messageIds = JSON.parse(event.data) as string[];
      const ids = new Set(messageIds);
      setMessageList((prev) =>
        prev.map((message) =>
          ids.has(message.id) ? {...message, read: true} : message,
        ),
      );
    };

    stream.addEventListener('message-created', handleMessageCreated);
    stream.addEventListener('message-read', handleMessageRead);

    return () => {
      clearInterval(pollInterval);
      stream.removeEventListener('message-created', handleMessageCreated);
      stream.removeEventListener('message-read', handleMessageRead);
      stream.close();
    };
  }, [orderId, onMessagesChange]);

  /** Sends text/image message via server action and appends new local message. */
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = values.content.trim();
    if ((!trimmed && !values.image) || !orderId) {
      return;
    }

    const formData = new FormData();
    formData.append('orderId', orderId);
    formData.append('content', trimmed);
    if (values.image) {
      formData.append('image', values.image);
    }

    const result = await sendMessageToOrder(formData);
    if (!result.ok) {
      return;
    }

    setMessageList((prev) => {
      if (prev.some((item) => item.id === result.data.id)) {
        return prev;
      }

      shouldScrollToLatestRef.current = true;
      return [...prev, result.data];
    });

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setValues({content: '', image: null});
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }

  /** Closes full-screen image gallery modal. */
  function handleCloseGallery() {
    setEnlargedImageUrl(null);
  }

  return (
    <div
      className={`bg-black/25 backdrop-blur-sm fixed inset-0 z-50 px-3 py-10 flex items-center justify-center overflow-x-hidden ${
        isClosing ? 'animate-fade-out' : 'animate-fade-in'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          close();
        }
      }}
      onAnimationEnd={() => {
        if (isClosing) {
          onClose();
        }
      }}
    >
      <div
        className={`relative flex flex-col w-full max-h-[calc(100vh-5rem)] bg-secondary rounded-lg overflow-x-hidden overflow-y-hidden
          shadow-[inset_0_0_10px_rgba(255,71,249,0.45)] px-2 py-6 max-w-md ${
            isClosing ? 'animate-fade-out' : 'animate-fade-in'
          }`}
      >
        <Svg
          icon={CLOSESVG}
          size={24}
          className='absolute top-1 right-2 cursor-pointer'
          onClick={close}
        />
        <div
          ref={messageListRef}
          className='no-scrollbar w-full flex-1 min-h-0 overflow-y-auto 
            overflow-x-hidden flex flex-col gap-4 px-1 pt-6 mb-14 pb-2'
        >
          {messageList &&
            messageList.map((message) => (
              <div
                key={message.id}
                data-message-id={message.id}
                className={`relative min-w-0 text-secondary mb-4 w-3/4 rounded ${
                  message.creator === 'Admin' ? 'self-end' : 'self-start'
                } ${
                  message.image?.img
                    ? 'bg-transparent p-0'
                    : message.creator === 'Admin'
                      ? 'bg-dark-text p-3'
                      : 'bg-primary p-3'
                }`}
              >
                <div
                  className={`absolute shadow-lg z-10 -top-4 bg-linear-to-r from-primary to-dark-text text-secondary px-2 rounded-full
                    text-sm
                  ${message.creator === 'Admin' ? '-right-1 ' : '-left-1 '}`}
                >
                  {message.creator}
                </div>
                <div
                  className={`text-xs text-tertiary absolute -top-4 max-w-[70%] truncate ${message.creator === 'Admin' ? 'left-2' : 'right-2'}`}
                >
                  {message.createdAt.toLocaleString('de-DE', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </div>
                <p className='text-sm text-secondary wrap-break-word whitespace-pre-wrap'>
                  {message.content}
                </p>
                {message.image?.img && (
                  <div className='relative mt-2 w-full max-h-60 overflow-hidden border border-primary rounded'>
                    <Image
                      onClick={() => setEnlargedImageUrl(message.image!.img)}
                      src={message.image.img}
                      alt='Attached'
                      width={400}
                      height={300}
                      className='w-full h-auto rounded object-contain'
                    />
                  </div>
                )}
                <span className='absolute -bottom-1 right-0 text-center text-green'>
                  {message.read ? '✓✓' : '✓'}
                </span>
              </div>
            ))}
          <div className='h-16 shrink-0' />
        </div>
        <div className='absolute bottom-4 left-0 right-0 px-2 flex flex-col gap-1 justify-center'>
          {imagePreviewUrl && (
            <div className='relative w-16 h-16 rounded-lg overflow-hidden border border-primary self-end mr-14'>
              <Image
                src={imagePreviewUrl}
                alt='Önizleme'
                fill
                className='object-cover'
              />
              <button
                type='button'
                onClick={clearImage}
                className='absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs leading-none'
              >
                ×
              </button>
            </div>
          )}
          <form
            className='w-full flex items-center gap-1'
            onSubmit={handleSubmit}
          >
            <div className='flex-1 min-w-0 bg-secondary'>
              <Input
                placeholder='Mesajınızı yazın...'
                name='content'
                value={values.content}
                onChange={handleChange}
                className='h-11 rounded-full px-3'
              />
              <input
                type='file'
                name='image'
                accept='image/*'
                hidden
                ref={imageInputRef}
                onChange={handleImageChange}
              />
            </div>
            <div
              className='flex gap-1 bg-gray/90 backdrop-blur-sm p-0.5 border border-white/30 
                rounded-full text-lg shadow-lg'
            >
              <GlassyButton
                type='submit'
                icon={SENDSVG}
                iconSize={32}
                className=''
              />
              <GlassyButton
                type='button'
                icon={ADDPHOTOSVG}
                iconSize={32}
                className='[&>svg]:stroke-4'
                onClick={() => imageInputRef.current?.click()}
              />
            </div>
          </form>
        </div>
      </div>
      {enlargedImageUrl && (
        <EnlargedImageGalery
          onCloseAction={handleCloseGallery}
          images={[enlargedImageUrl]}
        />
      )}
    </div>
  );
}
