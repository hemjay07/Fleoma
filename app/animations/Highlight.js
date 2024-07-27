import GSAP from "gsap";
import Animation from "../classes/Animation.js";

import _ from "lodash";

export default class Highlight extends Animation {
  constructor({ element, elements }) {
    super({
      element,
      elements,
    });
  }

  animateIn() {
    if (this.animating) {
      return;
    }
    this.animating = true;

    this.timelineIn = GSAP.timeline({ delay: 0.5 });

    this.timelineIn.fromTo(
      this.element,
      { autoAlpha: 0, scale: 1.2 },
      { autoAlpha: 1, scale: 1, ease: "expo.out", duration: 1.5 }
    );

    this.animating = false;
  }
  animateOut() {
    GSAP.set(this.element, { autoAlpha: 0 });
  }

}
