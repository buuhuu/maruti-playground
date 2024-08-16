function addClasses(title, subtitle, content) {
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

export default async function decorate() {
  const title = document.querySelector('.sf-about-us h2');
  const subtitle = document.querySelector('.sf-about-us h2 + p');
  const content = document.querySelector('.sf-about-us > div:nth-child(2) > div > div');
  const maxLength = 339;

  addClasses(title, subtitle, content);
  handleContentToggle(content, maxLength);
}
