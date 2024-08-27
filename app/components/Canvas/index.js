import GSAP from "gsap";

import { Camera, Renderer, Transform } from "ogl";

import About from "./About/index.js";
import Home from "./Home/index.js";
import Collections from "./Collections/index.js";
import Detail from "./Detail/index.js";
import Transition from "./Transition.js";

export default class Canvas {
  constructor({ template }) {
    this.template = template;

    this.x = {
      start: 0,
      distance: 0,
      end: 0,
    };
    this.y = {
      start: 0,
      distance: 0,
      end: 0,
    };
    this.createRenderer();
    this.createScene();
    this.createCamera();
    this.onResize();
  }

  createRenderer() {
    this.renderer = new Renderer({
      alpha: true,
      antialias: true,
    });

    this.gl = this.renderer.gl;

    document.body.appendChild(this.gl.canvas);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.position.z = 5;
  }
  createScene() {
    this.scene = new Transform();
  }

  // Home

  createHome() {
    this.home = new Home({ gl: this.gl, scene: this.scene, sizes: this.sizes });
    this.home.create;
  }

  destroyHome() {
    if (!this.home) return;

    this.home.destroy();
    this.home = null;
  }

  // About
  createAbout() {
    this.about = new About({
      gl: this.gl,
      scene: this.scene,
      sizes: this.sizes,
    });
  }

  destroyAbout() {
    if (!this.about) return;

    this.about.destroy();
    this.about = null;
  }

  // Collections
  createCollections() {
    this.collections = new Collections({
      gl: this.gl,
      scene: this.scene,
      sizes: this.sizes,
      transition: this.transition,
    });
  }

  destroyCollections() {
    if (!this.collections) return;

    this.collections.destroy();
    this.collections = null;
  }

  //  Detail
  createDetail() {
    this.detail = new Detail({
      gl: this.gl,
      scene: this.scene,
      sizes: this.sizes,
      transition: this.transition,
    });
  }

  destroyDetail() {
    if (!this.detail) return;

    this.detail.destroy();
    this.detail = null;
  }

  // Events

  onPreloaded() {
    this.onChangeEnd(this.template);
  }
  onChangeStart(template, url) {
    if (this.home) {
      this.home.hide();
    }

    if (this.about) {
      this.about.hide();
    }

    if (this.collections) {
      this.collections.hide();
    }

    if (this.detail) {
      this.detail.hide();
    }

    // this helps to check if the user is going from the collection to the detail page or otherwise
    this.isFromCollectionsToDetail =
      this.template === "collections" && url.indexOf("detail") > -1;

    this.isDetailToCollections =
      this.template === "detail" && url.indexOf("collections") > -1;

    if (this.isFromCollectionsToDetail || this.isDetailToCollections) {
      this.transition = new Transition({
        collections: this.collections,
        gl: this.gl,
        scene: this.scene,
        url,
      });

      this.transition.setElement(this.collections || this.detail);
    }
  }
  onChangeEnd(template) {
    if (template === "home") {
      this.createHome();
      // console.log("home canvas created");
    } else {
      this.destroyHome();
    }

    if (template === "about") {
      this.createAbout();
    } else {
      this.destroyAbout();
    }

    if (template === "detail") {
      this.createDetail();
    } else if (this.detail) {
      this.destroyDetail();
    }

    if (template === "collections") {
      // make the canvas on top of the other elements in the page
      this.createCollections();
    } else {
      this.destroyCollections();
    }

    this.template = template;
  }

  onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.perspective({
      aspect: window.innerWidth / window.innerHeight,
    });
    const fov = this.camera.fov * (Math.PI / 180);
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;

    this.sizes = {
      height,
      width,
    };

    if (this.detail) {
      this.detail.onResize({ sizes: this.sizes });
    }

    if (this.home) {
      console.log("resize home", this.template);
      this.home.onResize({
        sizes: this.sizes,
      });
    }

    if (this.about) {
      this.about.onResize({
        sizes: this.sizes,
      });
    }

    if (this.collections) {
      this.collections.onResize({
        sizes: this.sizes,
      });
    }
  }

  onTouchDown(event) {
    // we only want the user to be able to move the canvas when the mouse is held down not just when the mouse is moving over the canvas. This is why we are using the isDown variable. If isDown is true then we can move then we update the x and y values of onTouchMove
    this.isDown = true;

    this.x.start = event.touches ? event.touches[0].clientX : event.clientX;
    this.y.start = event.touches ? event.touches[0].clientY : event.clientY;

    const values = {
      x: this.x,
      y: this.y,
    };

    if (this.home) {
      this.home.onTouchDown(values);
    }
    if (this.about) {
      this.about.onTouchDown(values);
    }

    if (this.collections) {
      this.collections.onTouchDown(values);
    }
  }

  onTouchMove(event) {
    if (!this.isDown) return;
    const x = event.touches ? event.touches[0].clientX : event.clientX;
    const y = event.touches ? event.touches[0].clientY : event.clientY;

    this.x.end = x;
    this.y.end = y;

    const values = {
      x: this.x,
      y: this.y,
    };

    if (this.home) {
      this.home.onTouchMove(values);
    }

    if (this.about) {
      this.about.onTouchMove(values);
    }

    if (this.collections) {
      this.collections.onTouchMove(values);
    }
  }

  onTouchUp(event) {
    this.isDown = false;

    const x = event.changedTouches
      ? event.changedTouches[0].clientX
      : event.clientX;
    const y = event.changedTouches
      ? event.changedTouches[0].clientY
      : event.clientY;

    this.x.end = x;
    this.y.end = y;

    const values = {
      x: this.x,
      y: this.y,
    };

    if (this.home) {
      this.home.onTouchUp(values);
    }

    if (this.about) {
      this.about.onTouchUp(values);
    }

    if (this.collections) {
      this.collections.onTouchUp(values);
    }
  }

  onWheel(event) {
    if (this.home) {
      this.home.onWheel(event);
    }

    // if (this.about) {
    //   this.about.onWheel(event);
    // }

    if (this.collections) {
      this.collections.onWheel(event);
    }
  }

  update(scroll) {
    if (this.home) {
      this.home.update();
    }

    if (this.about) {
      this.about.update(scroll);
    }

    if (this.collections) {
      this.collections.update();
    }

    this.renderer.render({ scene: this.scene, camera: this.camera });
  }
}
