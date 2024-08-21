import { loadBlock } from '../../scripts/aem.js';

function addClasses(block, title, subtitle, content) {
  block.classList.add('dynamic-block');
  if (title) {
    title.classList.add('sf-text-title');
  }

  if (subtitle) {
    subtitle.classList.add('sf-text-subtitle');
  }

  if (content) {
    content.parentElement.classList.add('sf-text-content');
  }
}

function createToggleButton(text) {
  const button = document.createElement('button');
  button.textContent = text;
  button.classList.add('toggle-read-button');
  return button;
}

function handleContentToggle(content, maxLength) {
  if (content.textContent.length > maxLength) {
    const originalText = content.textContent;
    const truncatedText = `${originalText.substring(0, maxLength)}...`;
    const toggleReadButton = createToggleButton('Read More');

    content.textContent = truncatedText;
    content.appendChild(toggleReadButton);

    toggleReadButton.addEventListener('click', () => {
      if (toggleReadButton.textContent === 'Read More') {
        content.textContent = originalText;
        toggleReadButton.textContent = 'Read Less';
      } else {
        content.textContent = truncatedText;
        toggleReadButton.textContent = 'Read More';
      }
      content.appendChild(toggleReadButton);
    });
  }
}

function handleSelection({ detail: { prop, element } }) {
  if (prop === 'ctas_submit') {
    const faqItems = document.querySelectorAll('.faq-item');
    for (let i = 0; i < faqItems.length; i += 1) {
      faqItems[i].style.display = 'block';
    }
    document.getElementById('viewMoreBtn').style.display = 'none';
  } else {
    // close all details
    document.querySelectorAll('details').forEach((details) => {
      details.open = false;
    });
    const details = element.matches('details') ? element : element.querySelector('details');
    if (details) {
      details.open = true;
    }
  }
}

function getBlockFromHtml(blockHtml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(blockHtml, 'text/html');
  return doc.body.firstChild;
}

function handleContentUpdate({ detail: update }) {
  const newBlock = getBlockFromHtml(update);
  const oldBlock = document.querySelector('.faq');
  newBlock.style.display = 'none';
  oldBlock.insertAdjacentElement('afterend', newBlock);
  loadBlock(newBlock).then(() => {
    oldBlock.remove();
    newBlock.style.display = null;
  });
}

export default async function decorate(block) {
  const title = document.querySelector('.sf-about-us h2');
  const subtitle = document.querySelector('.sf-about-us h2 + p');
  const content = document.querySelector('.sf-about-us > div:nth-child(2) > div > div');
  const maxLength = 339;

  addClasses(block, title, subtitle, content);
  handleContentToggle(content, maxLength);
  block.addEventListener('navigate-to-route', handleSelection);
  block.addEventListener('apply-update', handleContentUpdate);
}
