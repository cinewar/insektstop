'use client';

import {Button} from '@/app/components/Button';
import {Modal} from '@/app/components/Modal';
import {useState} from 'react';
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
    (message) => !message.read && message.creator === 'Admin',
  ).length;

  function handleOpenMessages() {
    setShowMessages(true);
  }

  // SSE logic removed. If you want to keep messages in sync, implement polling or another mechanism here.

  const title =
    modalType === 'create'
      ? 'Bereich und Raum erstellen'
      : 'Bereich und Raum bearbeiten';
  return (
    <>
      <div className='flex items-center mt-2 justify-center'>
        <Button
          className='shining'
          onClick={() => {
            setModalType('create');
            setShowModal(true);
          }}
        >
          Ort und Raum hinzufügen
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
