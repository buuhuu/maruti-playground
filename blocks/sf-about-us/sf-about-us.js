import utility from '../../utility/utility.js';

export default async function decorate(block) {
  function updateHtml() {
    const faqBlock = [...block.children].map((child) => {
      const [titleEl, subtitleEl, contentEl, toggleButtonEl] = [...child.children[0].children];

      const title = titleEl?.textContent?.trim();
      const subtitle = subtitleEl?.textContent?.trim();
      const toggleButton = toggleButtonEl?.textContent?.trim();
      const displayText = contentEl.innerHTML;
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
      if (contentEl.classList.contains('expanded')) {
        contentEl.classList.remove('expanded');
        toggleButtonEl.textContent = 'Read more';
      } else {
        contentEl.classList.add('expanded');
        toggleButtonEl.textContent = 'Read less';
      }
    });
  }

  updateHtml();
  initializeEventListeners();
}
