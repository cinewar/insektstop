'use client';

import {useEffect, useLayoutEffect, useRef, useState} from 'react';
import Svg from '@/app/components/Svg';
import {ADDPHOTOSVG, CLOSESVG, SENDSVG} from '@/app/utils/svg';
import {Message} from '../../../../../generated/prisma';
import {Input} from '@/app/components/Input';
import {GlassyButton} from '@/app/components/GlassyButton';
import {markOrderMessagesAsRead, sendMessageToOrder} from '../action';

interface MessageModalProps {
  onClose: () => void;
  messages?: Message[];
  orderId?: string;
  onMessagesChange?: (messages: Message[]) => void;
}

export function MessageModal({
  onClose,
  messages,
  orderId,
  onMessagesChange,
}: MessageModalProps) {
  const [value, setValue] = useState('');
  const [messageList, setMessageList] = useState<Message[]>(messages ?? []);
  const messageListRef = useRef<HTMLDivElement>(null);
  const shouldScrollToLatestRef = useRef(false);
  const firstUnreadMessageIdRef = useRef<string | null>(
    messages?.find((message) => !message.read)?.id ?? null,
  );
  const hasScrolledToFirstUnreadRef = useRef(false);

  function scrollToMessage(messageId: string, topRatio = 0.36) {
    const container = messageListRef.current;
    if (!container) {
      return;
    }

    const selector = `[data-message-id="${messageId}"]`;
    const target = container.querySelector(selector) as HTMLDivElement | null;
    if (!target) {
      return;
    }

    const nextTop = Math.max(
      target.offsetTop - container.clientHeight * topRatio,
      0,
    );
    container.scrollTo({
      top: nextTop,
      behavior: 'smooth',
    });
  }

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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
  }
  const [isClosing, setIsClosing] = useState(false);

  function close() {
    setIsClosing(true);
  }

  useEffect(() => {
    if (isClosing) {
      return;
    }

    onMessagesChange?.(messageList);
  }, [messageList, onMessagesChange, isClosing]);

  useLayoutEffect(() => {
    if (
      !hasScrolledToFirstUnreadRef.current &&
      firstUnreadMessageIdRef.current
    ) {
      scrollToMessage(firstUnreadMessageIdRef.current);
      hasScrolledToFirstUnreadRef.current = true;
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

    void syncReadState();

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
      stream.removeEventListener('message-created', handleMessageCreated);
      stream.removeEventListener('message-read', handleMessageRead);
      stream.close();
    };
  }, [orderId, onMessagesChange]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = value.trim();
    if (!trimmed || !orderId) {
      return;
    }

    const formData = new FormData();
    formData.append('orderId', orderId);
    formData.append('content', trimmed);

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

    setValue('');
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
      <Svg
        icon={CLOSESVG}
        size={24}
        className='absolute top-3 right-4 cursor-pointer'
        onClick={close}
      />
      <div
        className={`relative flex flex-col w-full max-h-[calc(100vh-5rem)] bg-secondary rounded-lg overflow-x-hidden overflow-y-hidden
          shadow-[inset_0_0_10px_rgba(255,71,249,0.45)] px-2 py-6 max-w-md ${
            isClosing ? 'animate-fade-out' : 'animate-fade-in'
          }`}
      >
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
                className={`relative min-w-0 text-secondary mb-4 w-3/4 p-3 rounded ${
                  message.creator === 'Admin'
                    ? 'self-end bg-dark-text'
                    : 'self-start bg-primary'
                }`}
              >
                <div
                  className={`absolute shadow-lg border -top-4 bg-gray text-secondary px-2 rounded-full
                  ${message.creator === 'Admin' ? '-right-1 border-primary ' : '-left-1 border-dark-text '}`}
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
              </div>
            ))}
          <div className='h-16 shrink-0' />
        </div>
        <div className='absolute bottom-4 left-0 right-0 px-2 flex justify-center'>
          <form
            className='w-full flex items-center gap-1'
            onSubmit={handleSubmit}
          >
            <div className='flex-1 min-w-0 bg-secondary'>
              <Input
                placeholder='Mesajınızı yazın...'
                name='content'
                value={value}
                onChange={handleChange}
                className='h-11 rounded-full px-3'
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
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
