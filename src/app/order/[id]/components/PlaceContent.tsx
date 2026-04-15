'use client';

import {Button} from '@/app/components/Button';
import {Modal} from '@/app/components/Modal';
import {useEffect, useState} from 'react';
import {PlaceForm} from './PlaceForm';
import {MessageButton} from './MessageButton';
import {Message} from '../../../../../generated/prisma';
import {MessageModal} from './MessageModal';

/**
 * Defines the PlaceContentProps interface.
 * Usage: Implement or consume PlaceContentProps when exchanging this structured contract.
 */
interface PlaceContentProps {
  orderId: string;
  messages: Message[];
}

/**
 * Describes behavior for PlaceContent.
 * Usage: Call PlaceContent(...) where this declaration is needed in the current module flow.
 */
export function PlaceContent({orderId, messages}: PlaceContentProps) {
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  const [showMessages, setShowMessages] = useState(false);
  const [messageList, setMessageList] = useState<Message[]>(messages);

  const unreadMessageCount = messageList.filter(
    (message) => !message.read,
  ).length;

  function handleOpenMessages() {
    setShowMessages(true);
  }

  useEffect(() => {
    if (!orderId) {
      return;
    }

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

        return [...prev, normalizedMessage];
      });
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
  }, [orderId]);

  const title =
    modalType === 'create' ? 'Mekan ve Oda Oluştur' : 'Mekan ve Oda Düzenle';
  return (
    <>
      <div className='flex items-center justify-center'>
        <Button
          className='shining'
          onClick={() => {
            setModalType('create');
            setShowModal(true);
          }}
        >
          Mekan ve Oda Ekle
        </Button>
        {showModal && (
          <Modal onClose={() => setShowModal(false)}>
            {({close}) => (
              <div className='relative'>
                <h2 className='text-lg font-bold mb-2'>{title}</h2>
                <PlaceForm
                  close={close}
                  modalType={modalType}
                  orderId={orderId}
                />
              </div>
            )}
          </Modal>
        )}
        <MessageButton
          count={showMessages ? 0 : unreadMessageCount}
          onClickAction={handleOpenMessages}
        />
      </div>
      {showMessages && (
        <MessageModal
          orderId={orderId}
          messages={messageList}
          onMessagesChange={setMessageList}
          onClose={() => setShowMessages(false)}
        />
      )}
    </>
  );
}
