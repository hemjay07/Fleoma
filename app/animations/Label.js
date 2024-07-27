import GSAP from "gsap";
import Animation from "../classes/Animation.js";

import _ from "lodash";

import { calculate, split } from "utils/text.js";

export default class Label extends Animation {
  constructor({ element, elements }) {
    super({
      element,
      elements,
    });

    this.elementLinesSpans = split({ element: this.element, append: true });
  }

  animateIn() {
    this.timelineIn = GSAP.timeline({ delay: 0.5 });

    this.timelineIn.set(this.element, { autoAlpha: 1 });

    _.forEach(this.elementLines, (line, index) => {
      this.timelineIn.fromTo(
        line,
        {
          y: "100%",
          autoAlpha: 0,
        },
        {
          autoAlpha: 1,
          delay: index * 0.2,
          duration: 1.5,
          ease: "expo.out",
          y: "0%",
        },
        0
      );
    });
  }
  animateOut() {
    GSAP.set(this.element, { autoAlpha: 0 });
  }

  onResize() {
    this.elementLines = calculate(this.elementLinesSpans);
  }
}
