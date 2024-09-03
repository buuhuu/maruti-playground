const maxLength = 339;

function addClasses(block, title, subtitle, content) {
  if (title) {
    title.classList.add('sf-text-title');
  }
  if (subtitle) {
    subtitle.classList.add('sf-text-subtitle');
  }
  if (content) {
    content.classList.add('sf-text-content');
  }
}

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
  const innerDiv = block.children[0].children[0];
  const [title, subtitle, content, toggleButton] = innerDiv.children;
  addClasses(block, title, subtitle, content);
  handleContentToggle(content, toggleButton);
  block.addEventListener('navigate-to-route', handleSelection);
}