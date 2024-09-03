import utility from '../../utility/utility.js';

const maxLength = 339;

function handleContentToggle(content, toggleButton) {
  if (content.textContent.length > maxLength) {
    const originalText = content.textContent;
    const truncatedText = `${originalText.substring(0, maxLength)}...`;
    // const toggleReadButton = createToggleButton('Read More');
    toggleButton.classList.add('toggle-read-button');
    content.textContent = truncatedText;
    content.appendChild(toggleButton);

    toggleButton.addEventListener('click', () => {
      if (toggleButton.textContent === 'Read More') {
        content.textContent = originalText;
        toggleButton.textContent = 'Read Less';
      } else {
        content.textContent = truncatedText;
        toggleButton.textContent = 'Read More';
      }
      content.appendChild(toggleButton);
    });
  }
}
function handleSelection({ detail: { prop } }) {
  if (prop === 'sf-about-us_ctas_submit') {
    const container = document.querySelector('.sf-about-us');
    const toggleButton = container.querySelectorAll('p')[2];
    toggleButton.click();
  }
}

export default async function decorate(block) {
  const faqBlock = [...block.children].map((child) => {
    const [
      titleEl,
      subtitleEl,
      contentEl,
      toggleButtonEl,
    ] = child.children;

    const title = titleEl?.textContent?.trim();
    const subtitle = subtitleEl?.textContent?.trim();
    const content = contentEl?.textContent?.trim();
    const toggleButton = toggleButtonEl?.textContent?.trim();

    child.innerHTML = '';
    child.insertAdjacentHTML(
      'beforeend',
      utility.sanitizeHtml(`
          <h2 id="maruti-suzuki-smart-finance" class="sf-text-title">${title}</h2>
<p class="sf-text-subtitle">${subtitle}</p>
<p class="sf-text-content">${content}<p class="toggle-read-button">${toggleButton}</p></p>
        `),
    );
    handleContentToggle(content, toggleButton);
    return child.outerHTML;
  }).join('');
  block.innerHTML = '';
  block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(faqBlock));
  block.addEventListener('navigate-to-route', handleSelection);
}
