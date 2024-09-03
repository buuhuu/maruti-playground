const utility = {
  eventListenersMap: new WeakMap(),

  addEventListenerWithTracking(element, event, handler, options) {
    if (!this.eventListenersMap.has(element)) {
      this.eventListenersMap.set(element, []);
    }
    this.eventListenersMap.get(element).push({ event, handler, options });
    element.addEventListener(event, handler, options);
  },

  copyEventListeners(sourceNode, targetNode) {
    const listeners = this.eventListenersMap.get(sourceNode) || [];
    listeners.forEach(({ event, handler, options }) => {
      targetNode.addEventListener(event, handler, options);
    });
  },

  cloneNodeWithEvents(node, deep = true) {
    const clone = node.cloneNode(deep);
    this.copyEventListeners(node, clone);
    if (deep) {
      const descendants = node.getElementsByTagName('*');
      const clonedDescendants = clone.getElementsByTagName('*');
      for (let i = 0; i < descendants.length; i += 1) {
        this.copyEventListeners(descendants[i], clonedDescendants[i]);
      }
    }
    return clone;
  },
  mobileLazyLoading(element, imgSelector) {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const imgElement = element.querySelector(imgSelector);
    if (isMobile && imgElement) {
      imgElement.setAttribute('loading', 'lazy');
    } else if (!isMobile && imgElement) {
      imgElement.setAttribute('loading', 'eager');
    }
  },
  /**
   * Format Price to Lakhs.
   */
  formatToLakhs(num) {
    if (num >= 100000) {
      const lakhs = (num / 100000).toFixed(2);
      return `${lakhs} lakhs`;
    }
    return num?.toString();
  },
  isInternalLink(href) {
    return !/^https?:\/\//i.test(href);
  },
  sanitizeHtml(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.innerHTML;
  },
  formatINR(number) {
    const numStr = number.toString();
    const { length } = numStr;

    if (length <= 3) {
      return numStr;
    }

    const lastThree = numStr.substring(length - 3);
    let rest = numStr.substring(0, length - 3);
    const parts = [];

    while (rest.length > 2) {
      parts.push(rest.substring(rest.length - 2));
      rest = rest.substring(0, rest.length - 2);
    }

    if (rest.length > 0) {
      parts.push(rest);
    }

    const formattedRest = parts.reverse().join(',');
    const formattedNumber = `${formattedRest},${lastThree}`;

    return formattedNumber;
  },
  initImage(image, altTextEl) {
    const img = image.querySelector('img');
    img.removeAttribute('width');
    img.removeAttribute('height');
    const alt = altTextEl?.textContent?.trim() || 'image';
    img.setAttribute('alt', alt);
  },
};

export const Viewport = (function initializeViewport() {
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

export default utility;
