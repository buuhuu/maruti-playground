import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const [titleContainer, ...faqItems] = block.children;
  titleContainer.classList.add('faq-title');

  const listItems = faqItems.map((item, index) => {
    const [label, body] = item.children;
    body.classList.add('faq-item-body');
    const summary = document.createElement('summary');
    summary.append(...label.childNodes);
    summary.classList.add('faq-item-label');
    const details = document.createElement('details');
    details.append(summary, body);
    details.classList.add('faq-item');
    details.open = index === 0;
    moveInstrumentation(item, details);
    item.remove();
    return details;
  });
  const list = document.createElement('div');
  list.classList.add('faq-list');
  list.append(...listItems);
  block.replaceChildren(titleContainer, list);
}
