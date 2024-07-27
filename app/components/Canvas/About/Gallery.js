import GSAP from "gsap";
import { Transform } from "ogl";

import Media from "./Media.js";

export default class Gallery {
  constructor({ element, index, geometry, scene, gl, sizes }) {
    this.elementWrapper = document.querySelector(".about__gallery__wrapper");

    this.element = element;
    this.index = index;
    this.geometry = geometry;
    this.scene = scene;
    this.gl = gl;
    this.sizes = sizes;

    this.group = new Transform();

    this.scroll = { current: 0, target: 0, start: 0, lerp: 0.1, velocity: 1 };

    this.createMedias();

    this.group.setParent(this.scene);

    this.onResize({
      sizes: this.sizes,
    });
  }

  createMedias() {
    this.MediasElements = this.element.querySelectorAll(
      ".about__gallery__media"
    );

    this.medias = _.map(this.MediasElements, (element, index) => {
      return new Media({
        element,
        geometry: this.geometry,
        index,
        scene: this.group,
        gl: this.gl,
        sizes: this.sizes,
      });
    });
  }
  // Animations

  show() {
    _.map(this.medias, (media) => media.show());
  }

  hide() {
    _.map(this.medias, (media) => media.hide());
  }

  // Events

  onResize(event) {
    this.bounds = this.elementWrapper.getBoundingClientRect();

    this.sizes = event.sizes;

    this.width = (this.bounds.width / window.innerWidth) * this.sizes.width;

    this.scroll.current = this.scroll.target = 0;

    _.map(this.medias, (media) => media.onResize(event, this.scroll.current));
  }

  onTouchDown({ x, y }) {
    this.scroll.start = this.scroll.current;
  }

  onTouchMove({ x, y }) {
    const distance = x.start - x.end;

    this.scroll.target = this.scroll.start - distance;
  }

  onTouchUp({ x, y }) {}

  update(scroll) {
    if (!this.bounds) return;

    const distance = scroll.current - scroll.target;
    const y = scroll.current / window.innerHeight;

    if (this.scroll.current < this.scroll.target) {
      this.direction = "right";
      this.scroll.velocity = -1;
    } else if (this.scroll.current > this.scroll.target) {
      this.direction = "left";
      this.scroll.velocity = 1;
    }

    // automatic scroll. The means that the gallery scrolls on its own thereby hinting the user that it is scrollable
    this.scroll.target -= this.scroll.velocity;

    // this gives the effect of the gallery scrolling as much as the user scrolls the page up or down
    this.scroll.target += distance * 0.1;

    this.scroll.current = GSAP.utils.interpolate(
      this.scroll.current,
      this.scroll.target,
      this.scroll.lerp
    );

    _.map(this.medias, (media, index) => {
      // The 0.25 is an offset to make sure that the image doesnt disappear too soon. This is due to the rotation of the image.
      const scaleX = media.mesh.scale.x / 2 + 0.25;

      if (this.direction === "left") {
        const x = media.mesh.position.x + scaleX;

        if (x < -this.sizes.width / 2) {
          media.extra += this.width;
        }
      } else if (this.direction === "right") {
        const x = media.mesh.position.x - scaleX;

        if (x > this.sizes.width / 2) {
          media.extra -= this.width;
        }
      }

      media.update(this.scroll.current);
    });

    // this makes sure the gallery scrolls in sync with the page scroll. y position is the percentage and we therefore still have to multiply it with the size
    this.group.position.y = y * this.sizes.height;
  }

  destroy() {
    this.scene.removeChild(this.group);
  }
}
