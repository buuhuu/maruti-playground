import utility from '../../utility/utility.js';

const maxLength = 339;

export default async function decorate(block) {
  let fullText = '';
  let truncatedText = '';
  let displayText = '';

  function updateHtml() {
    const faqBlock = [...block.children].map((child) => {
      const [titleEl, subtitleEl, contentEl, toggleButtonEl] = [...child.children[0].children];

      const title = titleEl?.textContent?.trim();
      const subtitle = subtitleEl?.textContent?.trim();
      const toggleButton = toggleButtonEl?.textContent?.trim();

      fullText = contentEl.innerText;
      truncatedText = `${fullText.substring(0, maxLength)}...`;
      if (document.querySelectorAll('.adobe-ue-edit .block.sf-about-us').length > 0) {
        // In edit mode, show full text
        displayText = fullText;
      } else {
        displayText = `${fullText.substring(0, maxLength)}...`;
      }
      child.innerHTML = '';
      child.insertAdjacentHTML(
        'beforeend',
        utility.sanitizeHtml(`
          <div>
           <h2 id="maruti-suzuki-smart-finance-title" class="sf-text-title">${title}</h2>
           <p class="sf-text-subtitle">${subtitle}</p>
           <p class="sf-text-content">${displayText}</p>
           <p class="toggle-read-button">${toggleButton}</p>
          </div>
        `),
      );
      return child.outerHTML;
    }).join('');
    block.innerHTML = '';
    block.insertAdjacentHTML('beforeend', utility.sanitizeHtml(faqBlock));
  }

  function initializeEventListeners() {
    const contentEl = document.querySelector('.sf-text-content');
    const toggleButtonEl = document.querySelector('.toggle-read-button');
    toggleButtonEl.addEventListener('click', () => {
      if (toggleButtonEl.textContent === 'Read More') {
        contentEl.innerText = fullText;
        toggleButtonEl.textContent = 'Read Less';
      } else {
        contentEl.innerText = truncatedText;
        toggleButtonEl.textContent = 'Read More';
      }
    });
  }

  updateHtml();
  initializeEventListeners();
}
