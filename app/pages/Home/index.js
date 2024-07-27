import Button from "classes/Button.js";
import Page from "classes/Page.js";

export default class Home extends Page {
  constructor() {
    super({
      id: "home",
      element: ".home",
      elements: {
        navigator: document.querySelector(".navigation"),
        link: ".home__link",
      },
    });
  }

  create() {
    super.create();

    this.link = new Button({ element: this.elements.link });
  }

  destroy() {
    super.destroy();

    this.link.removeEventListeners();
  }
}
