import GSAP from "gsap";
import Prefix from "prefix";

import _ from "lodash";

import Title from "../animations/Title.js";
import Label from "../animations/Label.js";
import Paragraphs from "../animations/Paragraph.js";
import Highlight from "../animations/Highlight.js";

import { ColorsManager } from "./Colors.js";

import AsyncLoad from "../classes/AsyncLoad.js";

export default class Page {
  constructor({ element, elements, id }) {
    {
      this.selector = element;
      this.selectorChildren = {
        ...elements,
        animationsTitles: '[data-animation="title"]',
        animationsParagraphs: '[data-animation="paragraph"]',
        animationsLabels: '[data-animation="label"]',
        animationsHighlights: '[data-animation="highlight"]',

        preloaders: "[data-src]",
      };

      this.id = id;

      this.transformPrefix = Prefix("transform");
      // console.log(this.transformPrefix);
    }
  }

  // this function is used to select the elements that are passed in the constructor, elements that we want to animate or work on. We call the function whenever we switch to a new page.
  create() {
    this.element = document.querySelector(this.selector);
    this.elements = {};
    this.scroll = {
      current: 0,
      target: 0,
      last: 0,
      limit: 0,
    };

    _.forEach(this.selectorChildren, (entry, key) => {
      // console.log(entry);

      // Check if entry is an HTML element
      // or a NodeList
      // or a selector

      // if its not one of these, then its probably a selector. In that case, querySelectAll is applied.
      //  If this returns an empty array, then its not a valid selector but if it returns an array with one element, then its a valid selector however it is just a single element. In that case, we can just use querySelector instead of querySelectorAll returns a nodelist. A nodelist is harder to work with.
      // console.log(entry);
      if (
        entry instanceof window.HTMLElement ||
        entry instanceof window.NodeList
      ) {
        this.elements[key] = entry;
      } else {
        this.elements[key] = document.querySelectorAll(entry);
        if (this.elements[key].length === 0) {
          this.elements[key] = null;
        } else {
          if (this.elements[key].length === 1) {
            this.elements[key] = document.querySelector(entry);
            // console.log(this.elements[key]);
          }
        }
      }
      // console.log(this.elements);
    });

    // console.log("Create", this.id, this.element, this.elements);

    this.createAnimations();
  }

  createAnimations() {
    this.animations = [];

    this.animationsTitles = _.map(this.elements.animationsTitles, (element) => {
      return new Title({ element });
    });
    this.animations.push(...this.animationsTitles);

    this.animationsParagraphs = _.map(
      this.elements.animationsParagraphs,
      (element) => {
        return new Paragraphs({ element });
      }
    );
    this.animations.push(...this.animationsParagraphs);

    this.animationsLabels = _.map(this.elements.animationsLabels, (element) => {
      return new Label({ element });
    });
    this.animations.push(...this.animationsTitles);

    this.animationsHighlights = _.map(
      this.elements.animationsHighlights,
      (element) => {
        return new Highlight({ element });
      }
    );
    this.animations.push(...this.animationsHighlights);
  }

  createPreloader() {
    this.preloaders = _.map(this.elements.preloaders, (element) => {
      return new AsyncLoad({ element });
    });
  }

  // Animations
  show(animation) {
    return new Promise((resolve) => {
      ColorsManager.change({
        backgroundColor: this.element.getAttribute("data-background"),
        color: this.element.getAttribute("data-color"),
      });

      if (animation) {
        this.animationIn = animation;
      } else {
        this.animationIn = GSAP.timeline();
        this.animationIn.fromTo(
          this.element,
          {
            autoAlpha: 0,
          },
          {
            autoAlpha: 1,
          }
        );
      }

      this.animationIn.call((_) => {
        this.addEventListeners();
        resolve();
      });
    });
  }

  hide() {
    return new Promise((resolve) => {
      // this.removeEventListeners();
      // OR;
      this.destroy();

      this.animationOut = GSAP.timeline();

      this.animationOut.to(this.element, {
        autoAlpha: 0,
        onComplete: resolve,
      });
    });
  }

  // Events

  onResize() {
    if (this.elements?.wrapper) {
      this.scroll.limit =
        this.elements.wrapper.clientHeight - window.innerHeight;
    }

    _.forEach(this.animations, (animation) => {
      animation.onResize();
    });
  }

  onWheel({ pixelY }) {
    this.scroll.target += pixelY;
  }

  // Loop
  update() {
    this.scroll.current = GSAP.utils.interpolate(
      this.scroll.current,
      this.scroll.target,
      0.1
    );
    this.scroll.target = GSAP.utils.clamp(
      0,
      this.scroll.limit,
      this.scroll.target
    );

    if (this.elements.wrapper) {
      this.elements.wrapper.style[this.transformPrefix] = `translateY(${-this
        .scroll.current}px)`;
    }
  }

  // Listeners
  addEventListeners() {}
  removeEventListeners() {}

  // Destroy
  destroy() {
    this.removeEventListeners();
  }
}
