import Component from "./Components.js";

export default class Animation extends Component {
  constructor({ element, elements }) {
    super({ element, elements });

    this.element = element;
    this.createObserver();

    this.animateOut();
  }

  createObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // console.log("animateIN");
          this.animateIn();
        } else {
          // console.log("animateOut");
          this.animateOut();
        }
      });
    });

    this.observer.observe(this.element);
  }

  animateIn() {}
  animateOut() {}
  onResize() {}
}
