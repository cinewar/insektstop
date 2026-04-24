import NewAccordion from './NewAccordion';
import {AccordionItem} from './NewAccordion';

interface AccordionWrapperProps {
  items: AccordionItem[];
}

export function AccordionWrapper({items}: AccordionWrapperProps) {
  const accordionItems = items.map((item) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    processStatus: item.processStatus,
    onAdd: item.onAdd,
    onEdit: item.onEdit,
    onDelete: item.onDelete,
  }));
  return <NewAccordion items={accordionItems} />;
}
