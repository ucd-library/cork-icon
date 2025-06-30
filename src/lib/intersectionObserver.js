/**
 * @description A singleton class that uses IntersectionObserver to observe elements
 * and fetch icon data when they come into view. Used when the fetch strategy is 'lazy'.
 */
class IconIntersectionObserver {
  constructor() {
    this.observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target;
          el.getIconData?.();
          this.unobserve(el);
        }
      }}),
      {
      root: null, // use the viewport as the root
      rootMargin: '0px',
      threshold: 0.1 // trigger when 10% of the element is visible
    };
  }

  observe(element) {
    this.observer.observe(element);
  }

  unobserve(element) {
    this.observer.unobserve(element);
  }

  disconnect() {
    this.observer.disconnect();
  }
}

export default new IconIntersectionObserver();
