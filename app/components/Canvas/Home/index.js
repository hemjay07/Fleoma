import { Plane, Transform } from "ogl";
import GSAP from "gsap";

import Media from "./Media.js";

import _ from "lodash";

export default class {
  constructor({ gl, scene, sizes }) {
    this.gl = gl;
    this.scene = scene;
    this.sizes = sizes;

    this.group = new Transform();

    this.galleryElement = document.querySelector(".home__gallery");
    this.mediasElements = document.querySelectorAll(
      ".home__gallery__media__image"
    );

    this.x = {
      current: 0,
      target: 0,
      lerp: 0.1,
    };

    this.y = {
      current: 0,
      target: 0,
      lerp: 0.1,
    };

    this.scrollCurrent = {
      x: 0,
      y: 0,
    };

    this.scroll = {
      x: 0,
      y: 0,
    };

    this.createGeometry();
    this.createGallery();

    this.group.setParent(this.scene);

    this.show();
  }

  createGeometry() {
    this.geometry = new Plane(this.gl);
  }

  createGallery() {
    this.medias = _.map(this.mediasElements, (element, index) => {
      return new Media({
        element,
        index,
        geometry: this.geometry,
        scene: this.scene,
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
    _.map(this.medias, (media) => media.onResize(event, this.scroll));

    // Never call getBoundingClientRect() in the update loop. IT IS VERY EXPENSIVE

    this.galleryBounds = this.galleryElement.getBoundingClientRect();

    this.sizes = event.sizes;

    // to get the size of the gallery at this viewport. We calculate the standard ratio of the gallery to the innerwidth remembering that it will always remain the same and then multiply it by the size defined by the camera.
    this.gallerySizes = {
      height:
        (this.galleryBounds.height / window.innerHeight) * this.sizes.height,
      width: (this.galleryBounds.width / window.innerWidth) * this.sizes.width,
    };
  }

  onTouchDown({ x, y }) {
    this.scrollCurrent.x = this.scroll.x;
    this.scrollCurrent.y = this.scroll.y;
  }

  onTouchMove({ x, y }) {
    const xDistance = x.start - x.end;
    const yDistance = y.start - y.end;

    this.x.target = this.scrollCurrent.x - xDistance;
    this.y.target = this.scrollCurrent.y - yDistance;
  }

  onTouchUp({ x, y }) {}

  onWheel({ pixelX, pixelY }) {
    this.x.target += pixelX;
    this.y.target += pixelY;
  }

  // Update

  update() {
    if (!this.galleryBounds) return;

    this.x.current = GSAP.utils.interpolate(
      this.x.current,
      this.x.target,
      this.x.lerp
    );

    this.y.current = GSAP.utils.interpolate(
      this.y.current,
      this.y.target,
      this.y.lerp
    );

    if (this.scroll.x < this.x.current) {
      this.x.direction = "right";
    } else if (this.scroll.x > this.x.current) {
      this.x.direction = "left";
    }

    if (this.scroll.y < this.y.current) {
      this.y.direction = "top";
    } else if (this.scroll.y > this.y.current) {
      this.y.direction = "bottom";
    }

    this.scroll.x = this.x.current;
    this.scroll.y = this.y.current;

    _.map(this.medias, (media, index) => {
      const scaleX = media.mesh.scale.x / 2;

      if (this.x.direction === "left") {
        const x = media.mesh.position.x + scaleX;

        if (x < -this.sizes.width / 2) {
          media.extra.x += this.gallerySizes.width;
        }
      } else if (this.x.direction === "right") {
        const x = media.mesh.position.x - scaleX;

        if (x > this.sizes.width / 2) {
          media.extra.x -= this.gallerySizes.width;
        }
      }

      const scaleY = media.mesh.scale.y / 2;
      if (this.y.direction === "top") {
        const y = media.mesh.position.y + scaleY;

        if (y < -this.sizes.height / 2) {
          media.extra.y += this.gallerySizes.height;
        }
      } else if (this.y.direction === "bottom") {
        const y = media.mesh.position.y - scaleY;

        if (y > this.sizes.height / 2) {
          media.extra.y -= this.gallerySizes.height;
        }
      }

      media.update(this.scroll);
    });
  }

  // Destroy
  destroy() {
    this.scene.removeChild(this.group);
    console.log("home gallery destroyed");
  }
}
