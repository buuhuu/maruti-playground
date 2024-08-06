const Viewport = (function initializeViewport() {
  let deviceType;

  const breakpoints = {
    mobile: window.matchMedia('(max-width: 47.99rem)'),
    tablet: window.matchMedia('(min-width: 48rem) and (max-width: 63.99rem)'),
    desktop: window.matchMedia('(min-width: 64rem)'),
  };

  function getDeviceType() {
    if (breakpoints.mobile.matches) {
      deviceType = 'Mobile';
    } else if (breakpoints.tablet.matches) {
      deviceType = 'Tablet';
    } else {
      deviceType = 'Desktop';
    }
    return deviceType;
  }
  getDeviceType();

  function isDesktop() {
    return deviceType === 'Desktop';
  }

  function isMobile() {
    return deviceType === 'Mobile';
  }
  function isTablet() {
    return deviceType === 'Tablet';
  }
  return {
    getDeviceType,
    isDesktop,
    isMobile,
    isTablet,
  };
}());

export default async function decorate(block) {
  const divs = block.querySelectorAll(':scope > div');

  // Add the class to the first div
  if (divs.length > 0) {
    divs[0].classList.add('jc-details');
    divs[0].querySelectorAll('h3').forEach((h3) => {
      const nextP = h3.nextElementSibling;
      if (nextP && nextP.tagName.toLowerCase() === 'p') {
        const wrapperDiv = document.createElement('div');
        wrapperDiv.classList.add('wrapped-content');
        h3.parentNode.insertBefore(wrapperDiv, h3);
        wrapperDiv.appendChild(h3);
        wrapperDiv.appendChild(nextP);
      }
    });
  }
  const caraousalDiv = document.createElement('div');
  caraousalDiv.classList.add('carousel-div');
  block.appendChild(caraousalDiv);
  const newDiv = document.createElement('div');
  newDiv.classList.add('jc-items');

  // Move the remaining divs into the new div and add the class 'jc-item-details'
  for (let i = 1; i < divs.length; i += 1) {
    const itemdiv = document.createElement('div');
    itemdiv.classList.add('jc-item');
    const arrowdiv = document.createElement('div');
    arrowdiv.classList.add('jc-arrow');
    itemdiv.appendChild(arrowdiv);
    divs[i].classList.add('jc-item-details');
    itemdiv.appendChild(divs[i]);

    if (i === 1) {
      const firstArrowdiv = document.createElement('div');
      firstArrowdiv.classList.add('jc-arrow');
      itemdiv.appendChild(firstArrowdiv);
    }
    newDiv.appendChild(itemdiv);
  }

  // Add the new div element to the block
  caraousalDiv.appendChild(newDiv);

  // Add the carousel functionality
  const navDiv = document.createElement('div');
  navDiv.classList.add('arrow-div');
  const leftArrow = document.createElement('div');
  leftArrow.classList.add('left-arrow');
  const rightArrow = document.createElement('div');
  rightArrow.classList.add('right-arrow');
  navDiv.appendChild(leftArrow);
  navDiv.appendChild(rightArrow);
  caraousalDiv.appendChild(navDiv);

  const jcItems = block.querySelector('.jc-items');
  let jcItemDetails = Array.from(block.querySelectorAll('.jc-item'));
  let currentIndex = 1; // Start from the second item (the first visible item)

  // Clone the first and last item
  const firstClone = jcItemDetails[0].cloneNode(true);
  firstClone.classList.add('clone');

  const lastClone = jcItemDetails[jcItemDetails.length - 1].cloneNode(true);
  lastClone.classList.add('clone');
  lastClone.classList.add('last');
  jcItems.prepend(lastClone);
  jcItems.appendChild(firstClone);

  // Update the jcItemDetails to include the clones
  jcItemDetails = Array.from(block.querySelectorAll('.jc-item'));

  // set background for jc-items div
  if (Viewport.isMobile()) {
    const backgroundDiv = block.querySelector('.journey-carousel .jc-items');
    const pictureDivs = block.querySelectorAll('.journey-carousel .jc-details picture');
    backgroundDiv.style.background = `url(${pictureDivs[0].querySelector('img').src}) center 60px no-repeat`;
    backgroundDiv.style.backgroundSize = '80% 80%';
  }

  function updateCarousel() {
    const itemWidth = jcItemDetails[0]?.offsetWidth || 0; // Get the width of one item
    jcItems.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
  }
  // Update the carousel when the transition ends
  jcItems.addEventListener('transitionend', () => {
    if (jcItemDetails[currentIndex] === firstClone) {
      jcItems.style.transition = 'none'; // Remove the transition effect
      currentIndex = 1; // Move to the first item
      jcItems.style.transform = `translateX(-${(currentIndex * (jcItemDetails[0]?.offsetWidth || 0))}px)`;
    } else if (jcItemDetails[currentIndex] === lastClone) {
      jcItems.style.transition = 'none'; // Remove the transition effect
      currentIndex = jcItemDetails.length - 2; // Move to the last item
      jcItems.style.transform = `translateX(-${(currentIndex * (jcItemDetails[0]?.offsetWidth || 0))}px)`;
    }
  });

  leftArrow.addEventListener('click', () => {
    if (currentIndex <= 0) {
      jcItems.style.transition = 'none'; // Remove the transition effect
      currentIndex = jcItemDetails.length - 2; // Move to the last item
      jcItems.style.transform = `translateX(-${(currentIndex * (jcItemDetails[0]?.offsetWidth || 0))}px)`;
    }
    setTimeout(() => {
      jcItems.style.transition = 'transform 0.25s ease-in-out 0s'; // Add the transition effect
      currentIndex = (currentIndex - 1 + jcItemDetails.length) % jcItemDetails.length;
      lastClone.style.display = 'block';
      firstClone.style.display = 'block';
      updateCarousel();
    }, 0);
  });

  rightArrow.addEventListener('click', () => {
    if (currentIndex >= jcItemDetails.length - 1) {
      jcItems.style.transition = 'none'; // Remove the transition effect
      currentIndex = 1; // Move to the first item
      jcItems.style.transform = `translateX(-${(currentIndex * (jcItemDetails[0]?.offsetWidth || 0))}px)`;
    }
    setTimeout(() => {
      jcItems.style.transition = 'transform 0.25s ease-in-out 0s'; // Add the transition effect
      currentIndex = (currentIndex + 1) % jcItemDetails.length;
      firstClone.style.display = 'block';
      lastClone.style.display = 'block';
      updateCarousel();
    }, 0);
  });

  function updateView() {
    const clones = block.querySelectorAll('.clone');
    const arrowDiv = document.querySelector('.arrow-div');

    // Check device type
    Viewport.getDeviceType();

    if (Viewport.isTablet()) {
      clones.forEach((item) => {
        item.style.display = 'block';
      });
      arrowDiv.style.display = 'block';
      currentIndex = 1;
    } else {
      // Desktop screens
      clones.forEach((item) => {
        item.style.display = 'none';
      });
      currentIndex = 0;
      arrowDiv.style.display = 'none';
    }
    updateCarousel();

    if (Viewport.isMobile()) {
      const backgroundDiv = block.querySelector('.journey-carousel .jc-items');
      const pictureDivs = block.querySelectorAll('.journey-carousel .jc-details picture');
      backgroundDiv.style.background = `url(${pictureDivs[0].querySelector('img').src}) center 60px no-repeat`;
      backgroundDiv.style.backgroundSize = '80% 80%';
    } else {
      const backgroundDiv = block.querySelector('.journey-carousel .jc-items');
      backgroundDiv.style.background = 'none';
    }
  }
  // Add event listener for window resize
  window.addEventListener('resize', updateView);
}