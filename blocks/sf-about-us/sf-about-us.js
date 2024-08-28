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

export default async function decorate(block) {
  const title = block.querySelector('h2');
  const subtitle = block.querySelectorAll('p')[0];
  const content = block.querySelectorAll('p')[1];
  const toggleButton = block.querySelectorAll('p')[2];

  addClasses(block, title, subtitle, content);
  handleContentToggle(content, toggleButton);
}
