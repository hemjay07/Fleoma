import { Plane, Transform } from "ogl";
import GSAP from "gsap";

import Gallery from "./Gallery.js";

import _ from "lodash";

export default class {
  constructor({ gl, scene, sizes }) {
    this.gl = gl;
    this.scene = scene;
    this.sizes = sizes;

    this.group = new Transform();

    this.createGeometry();
    this.createGalleries();

    this.onResize({
      sizes: this.sizes,
    });

    this.group.setParent(this.scene);

    this.show();
  }

  createGeometry() {
    this.geometry = new Plane(this.gl);
  }

  createGalleries() {
    this.galleryElement = document.querySelectorAll(".about__gallery");

    this.galleries = _.map(this.galleryElement, (element, index) => {
      return new Gallery({
        element,
        index,
        geometry: this.geometry,
        scene: this.group,
        gl: this.gl,
        sizes: this.sizes,
      });
    });
  }

  // Animations

  show() {
    _.map(this.galleries, (gallery) => gallery.show());
  }

  hide() {
    _.map(this.galleries, (gallery) => gallery.hide());
  }

  // Events

  onResize(event) {
    _.map(this.galleries, (gallery) => gallery.onResize(event));
  }

  onTouchDown(event) {
    _.map(this.galleries, (gallery) => gallery.onTouchDown(event));
  }

  onTouchMove(event) {
    _.map(this.galleries, (gallery) => gallery.onTouchMove(event));
  }

  onTouchUp(event) {
    _.map(this.galleries, (gallery) => gallery.onTouchUp(event));
  }

  onWheel({ pixelX, pixelY }) {}

  // Update

  update(scroll) {
    _.map(this.galleries, (gallery) => gallery.update(scroll));
  }

  // Destroy
  destroy() {
    _.map(this.galleries, (gallery) => gallery.destroy());
    console.log("about gallery destroyed");
  }
}
