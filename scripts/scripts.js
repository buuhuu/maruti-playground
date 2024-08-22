import {
  sampleRUM,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
  wrapTextNodes,
  buildBlock,
  createOptimizedPicture,
} from './aem.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * Moves all the attributes from a given elmenet to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveAttributes(from, to, attributes) {
  if (!attributes) {
    // eslint-disable-next-line no-param-reassign
    attributes = [...from.attributes].map(({ nodeName }) => nodeName);
  }
  attributes.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}

/**
 * Move instrumentation attributes from a given element to another given element.
 * @param {Element} from the element to copy attributes from
 * @param {Element} to the element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  moveAttributes(
    from,
    to,
    [...from.attributes]
      .map(({ nodeName }) => nodeName)
      .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-')),
  );
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

function buildMultiStepForms(main) {
  const multiStepForms = ['sf-journey-start'];
  multiStepForms.forEach((form) => {
    const formStepClassName = `${form}-step`;
    const formStepSelector = `.${formStepClassName}`;
    // multi-step forms are sections that have a least one step
    main.querySelectorAll(`:scope > div:not([data-section-status]):has(${formStepSelector})`).forEach((formSection) => {
      const firstStep = formSection.querySelector(formStepSelector);
      const previousElement = firstStep.previousElementSibling;
      // wrap all consecutive steps in a new block
      const steps = [];
      let step = firstStep;
      do {
        step.classList.remove(formStepClassName);
        wrapTextNodes(step);
        steps.push([step]);
        step = step.nextElementSibling;
      } while (step && step.matches(formStepSelector));
      // remove any remaining out-of-order steps
      formSection.querySelectorAll(formStepSelector).forEach((s) => s.remove());
      // create a new block and replace the first step with it
      const block = buildBlock(form, steps);
      if (previousElement) previousElement.after(block);
      else formSection.prepend(block);
    });
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
export function buildAutoBlocks(main) {
  try {
    buildMultiStepForms(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates delivery assets by replacing anchor elements with optimized pictures.
 * @param {HTMLElement} main - The main element containing the anchor elements.
 */
function decorateDeliveryAssets (main) {
  const anchors = Array.from(main.getElementsByTagName('a'));
  const deliveryUrls = anchors.filter((anchor) => anchor.textContent.includes('delivery'));

  if (deliveryUrls.length > 0) {
    deliveryUrls.forEach((anchor) => {
      const deliveryUrl = anchor.textContent;
      const altText = anchor.title;
      console.log('deliveryUrl', deliveryUrl);
      const picture = createOptimizedPicture(deliveryUrl, altText);
      anchor.replaceWith(picture);
    });
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateDeliveryAssets(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
  import('./sidekick.js').then(({ initSidekick }) => initSidekick());
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

export function mergeImagesForArtDirection(img, imgMobile) {
  const removeInstrumentation = (of) => {
    const attributes = [...of.attributes].filter(
      ({ nodeName }) => nodeName.startsWith('data-aue-') || nodeName.startsWith('data-richtext-'),
    );
    if (attributes.length) {
      // eslint-disable-next-line no-restricted-syntax
      for (const { nodeName } of attributes) of.removeAttribute(nodeName);
      // eslint-disable-next-line max-len
      return attributes.reduce((prev, { nodeName, nodeValue }) => ({ ...prev, [nodeName]: nodeValue }), {});
    }
    return null;
  };
  const applyDynamicInstrumentation = () => {
    const dynamicInstrumentation = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const entry of [[img, 'min-width: 600px'], [imgMobile]]) {
      const [element, mediaQuery = ''] = entry;
      const instrumentation = removeInstrumentation(element);
      if (!instrumentation) {
        return;
      }
      dynamicInstrumentation[mediaQuery] = instrumentation;
    }
    imgMobile.dataset.dynamicInstrumentation = JSON.stringify(dynamicInstrumentation);
  };

  if (imgMobile) {
    const pictureMobile = imgMobile.parentElement;
    // merge the imgMobile into the img:
    // the sources have min-width media queries for desktop,
    // we select the one without a media query which is for mobile
    const pictureMobileMobileSource = pictureMobile.querySelector('source:not([media])');
    if (pictureMobileMobileSource) {
      const pcitureMobileSource = img.parentElement.querySelector('source:not([media])');
      if (pcitureMobileSource) pcitureMobileSource.replaceWith(pictureMobileMobileSource);
      else img.before(pictureMobileMobileSource);
    } else {
      // create a source if there are non (authoring specific case)
      const source = document.createElement('source');
      source.srcset = img.src;
      source.media = '(min-width: 600px)';
      img.before(source);
    }
    // the fallback image should also be the mobile one itself is also mobile so replace it
    img.replaceWith(imgMobile);
    // remove picture mobile
    const p = pictureMobile.parentElement;
    pictureMobile.remove();
    if (p.children.length === 0 && !p.textContent.trim()) p.remove();
    // the instrumentation depends on the viewport size, so we remove it
    applyDynamicInstrumentation();
  }
}

loadPage();
