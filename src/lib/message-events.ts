import {EventEmitter} from 'node:events';
import type {Message} from '../../generated/prisma/client';

export type MessageCreatedEvent = {
  type: 'message-created';
  orderId: string;
  message: Message;
};

export type MessageReadEvent = {
  type: 'message-read';
  orderId: string;
  messageIds: string[];
};

type OrderEvent = MessageCreatedEvent | MessageReadEvent;

type OrderEventListener = (event: OrderEvent) => void;

class OrderMessageEventBus {
  private readonly emitter = new EventEmitter();

  subscribe(orderId: string, listener: OrderEventListener) {
    const channel = this.getChannel(orderId);
    this.emitter.on(channel, listener);

    return () => {
      this.emitter.off(channel, listener);
    };
  }

  publishMessageCreated(orderId: string, message: Message) {
    this.emitter.emit(this.getChannel(orderId), {
      type: 'message-created',
      orderId,
      message,
    } satisfies MessageCreatedEvent);
  }

  publishMessagesRead(orderId: string, messageIds: string[]) {
    this.emitter.emit(this.getChannel(orderId), {
      type: 'message-read',
      orderId,
      messageIds,
    } satisfies MessageReadEvent);
  }

  private getChannel(orderId: string) {
    return `order:${orderId}`;
  }
}

declare global {
  var __orderMessageEventBus: OrderMessageEventBus | undefined;
}

export const orderMessageEventBus =
  globalThis.__orderMessageEventBus ?? new OrderMessageEventBus();

if (!globalThis.__orderMessageEventBus) {
  globalThis.__orderMessageEventBus = orderMessageEventBus;
}
