import Component from "../classes/Components.js";

export default class AsyncLoad extends Component {
  constructor({ element }) {
    super({ element });

    this.createObserver();
  }

  createObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!this.element.src) {
            this.element.src = this.element.getAttribute("data-src");
            this.element.onload = (_) => {
              this.element.classList.add("loaded");
            };
          }
        }
      });
    });

    this.observer.observe(this.element);
  }
}
