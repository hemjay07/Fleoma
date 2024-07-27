import { Texture } from "ogl";
import _ from "lodash";

import GSAP from "gsap";

import Components from "classes/Components.js";

import { split } from "utils/text.js";

export default class Preloader extends Components {
  constructor({ canvas }) {
    console.log("preloader created");
    super({
      element: ".preloader",
      elements: {
        title: ".preloader__text",
        number: ".preloader__number",
        numberText: ".preloader__number__text",
      },
    });

    this.canvas = canvas;
    window.TEXTURES = {};
    console.log(window.TEXTURES);

    // split twice thereby burying each line in 2 layers of span
    split({
      element: this.elements.title,
      expression: "<br>",
    });
    split({
      element: this.elements.title,
      expression: "<br>",
    });

    this.elements.titleSpans = document.querySelectorAll("span span");

    this.createLoader();

    this.length = 0;
  }

  createLoader() {
    window.ASSETS.forEach((image) => {
      const texture = new Texture(this.canvas.gl, {
        generateMipmaps: false,
      });

      const media = new window.Image();

      media.crossOrigin = "anonymous";
      media.src = image;
      media.onload = (_) => {
        texture.image = media;

        this.onAssetLoaded();
      };

      window.TEXTURES[image] = texture;
      // console.log(window.TEXTURES);
    });
  }

  // This is used to calculate the preloader value. The fraction of loaded images to the total number of images.
  onAssetLoaded(image) {
    this.length += 1;

    const percent = this.length / window.ASSETS.length;

    this.elements.numberText.innerHTML = `${Math.round(percent * 100)}%`;

    if (percent === 1) {
      this.onLoaded();
    }
  }

  onLoaded() {
    return new Promise((resolve) => {
      this.emit("completed");

      this.animateOut = GSAP.timeline({ delay: 2 });

      this.animateOut.to(this.elements.titleSpans, {
        duration: 2,
        ease: "expo.out",
        stagger: 0.1,
        y: "100%",
      });

      this.animateOut.to(
        this.elements.numberText,
        {
          duration: 2,
          ease: "expo.out",
          stagger: 0.1,
          y: "100%",
        },
        "-=1.5"
      );

      this.animateOut.to(this.element, {
        scaleY: 0,
        transformOrigin: "0 100%",
      });

      this.animateOut.call((_) => {
        this.destroy();
      });
    });
  }

  destroy() {
    this.element.parentNode.removeChild(this.element);
  }
}
