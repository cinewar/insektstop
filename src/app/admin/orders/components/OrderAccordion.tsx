import Accordion from '@/app/components/Accordion';
import {Order} from '../../../../../generated/prisma';

interface OrderAccordionProps {
  items: Order[];
}

export function OrderAccordion({items}: OrderAccordionProps) {
  const accordionItems = items.map((order) => ({
    id: order.id,
    title: order.orderName,
    content: <div>content</div>,
  }));

  return <Accordion items={accordionItems} />;
}
