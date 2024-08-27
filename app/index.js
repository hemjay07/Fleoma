import NormalizeWheel from "normalize-wheel";

import _ from "lodash";

import Canvas from "./components/Canvas/index.js";

import Navigation from "./components/Navigation.js";
import Preloader from "./components/Preloader.js";

import About from "./pages/About/index.js";
import Home from "./pages/Home/index.js";
import Collections from "./pages/Collections/index.js";
import Detail from "./pages/Detail/index.js";

class App {
  constructor() {
    // the content should preferably come first
    this.createContent();

    // canvas before the preloader so that we can pass the canvas to the preloader
    this.createCanvas();
    this.createPreloader();
    this.createNavigation();
    this.createPages();

    this.addEventListeners();
    this.addLinkListeners();

    this.onResize();

    this.update();
  }

  createNavigation() {
    this.navigation = new Navigation({ template: this.template });
  }

  // Preloader Business
  createPreloader() {
    this.preloader = new Preloader({ canvas: this.canvas });
    this.preloader.once("completed", this.onPreloaded.bind(this));
  }

  createCanvas() {
    this.canvas = new Canvas({ template: this.template });
  }

  // Events
  onPreloaded() {
    this.onResize();

    this.canvas.onPreloaded();

    this.page.show();
  }

  // this tells the browser that you are just going to the url(using the back or forward button) but there is no need to push that url to the history. Rather than delibrate state change within the application that would normallu use "push state"
  onPopState() {
    this.onChange({ url: window.location.pathname, push: false });
  }

  //-----------------------------------------------------------------------------------------------------------------------------------------------

  createContent() {
    this.content = document.querySelector(".content");
    this.template = this.content.getAttribute("data-template");
  }

  createPages() {
    this.pages = {
      about: new About(),
      home: new Home(),
      collections: new Collections(),
      detail: new Detail(),
    };

    this.page = this.pages[this.template];
    this.page.create();
  }

  async onChange({ url, push = true }) {
    this.canvas.onChangeStart(this.template, url);
    console.log(url);
    await this.page.hide(); // Hide the current page before fetching the new page.

    // Once a link is clicked, instead of going to the routing to the page, we fetch the page and replace the content of the current page with the content of this new page.
    const request = await window.fetch(url);

    if (request.status === 200) {
      const html = await request.text();

      const div = document.createElement("div");

      if (push) {
        window.history.pushState({}, "", url);
      }

      div.innerHTML = html;

      // we want to replace only the content part. Other parts such as the doctype, navigation and things that are common to all pages should not be replaced.
      const divContent = div.querySelector(".content");
      this.template = divContent.getAttribute("data-template");

      this.navigation.onChange(this.template);

      // Now subtitute the content of the current page with the content of the new page that was fetched.
      this.content.setAttribute("data-template", this.template);
      this.content.innerHTML = divContent.innerHTML;

      // Now we have to create the new page (create the elements that we want to animate or work on) and we want to animate the page in.
      this.page = this.pages[this.template];

      this.page.create();
      this.onResize();

      this.page.show();

      this.canvas.onChangeEnd(this.template);

      // update the list of links since we have new links in the new page.
      this.addLinkListeners();
    } else {
      console.log("Error");
    }
  }
  onResize() {
    if (this.canvas && this.canvas.onResize) {
      this.canvas.onResize();
    }

    if (this.page && this.page.onResize) {
      this.page.onResize();
    }
  }

  onTouchDown(event) {
    if (this.canvas && this.canvas.onTouchDown) {
      this.canvas.onTouchDown(event);
    }
  }

  onTouchMove(event) {
    if (this.canvas && this.canvas.onTouchMove) {
      this.canvas.onTouchMove(event);
    }
  }

  onTouchUp(event) {
    if (this.canvas && this.canvas.onTouchUp) {
      this.canvas.onTouchUp(event);
    }
  }

  onWheel(event) {
    const normalizedWheel = NormalizeWheel(event);
    if (this.canvas && this.canvas.onWheel) {
      this.canvas.onWheel(normalizedWheel);
    }

    if (this.page && this.page.onWheel) {
      this.page.onWheel(normalizedWheel);
    }
  }

  // loop
  update() {
    if (this.page && this.page.update) {
      this.page.update();
    }
    // The canvas should be updated after and not before the page is updated, this was we have the correct Y positioning of the page
    if (this.canvas && this.canvas.update) {
      this.canvas.update(this.page.scroll);
    }

    this.frame = requestAnimationFrame(this.update.bind(this));
  }

  // Listeners
  addEventListeners() {
    window.addEventListener("mousewheel", this.onWheel.bind(this));
    window.addEventListener("mousedown", this.onTouchDown.bind(this));
    window.addEventListener("mousemove", this.onTouchMove.bind(this));
    window.addEventListener("mouseup", this.onTouchUp.bind(this));

    window.addEventListener("touchstart", this.onTouchDown.bind(this));
    window.addEventListener("touchmove", this.onTouchMove.bind(this));
    window.addEventListener("touchend", this.onTouchUp.bind(this));

    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener("popstate", this.onPopState.bind(this));
  }
  addLinkListeners() {
    const links = document.querySelectorAll("a");

    _.forEach(links, (link) => {
      link.onclick = (event) => {
        event.preventDefault();

        const { href } = link;
        this.onChange({ url: href });
      };
    });
  }
}

new App();
