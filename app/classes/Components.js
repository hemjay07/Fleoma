import EventEmitter from "events"; //the EventEmitter class is a class from the node.js library that allows us to create our own custom events. e.g to emit an event when all the images in the home page (we dont necessarily have to preload all the images in the entire applicaition) have been loaded. We then listen on the preloader page so that we can transition away from the preloader page to the home page.

import _ from "lodash";

export default class Components extends EventEmitter {
  constructor({ element, elements, id }) {
    {
      super();
      this.selector = element;
      this.selectorChildren = { ...elements };

      this.create(); //we call the create automatically necause we dont need to initailize it in specific components.

      this.addEventListeners();
    }
  }

  // this function is used to select the elements that are passed in the constructor, elements that we want to animate or work on. We call the function whenever we switch to a new page.
  create() {
    if (this.selector instanceof window.HTMLElement) {
      this.element = this.selector;
    } else {
      this.element = document.querySelector(this.selector);
    }

    this.elements = {};
    _.forEach(this.selectorChildren, (entry, key) => {
      // console.log(entry);

      // Check if entry is an HTML element
      // or a NodeList
      // or a selector

      // if its not one of these, then its probably a selector. In that case, querySelectAll is applied.
      //  If this returns an empty array, then its not a valid selector but if it returns an array with one element, then its a valid selector however it is just a single element. In that case, we can just use querySelector instead of querySelectorAll returns a nodelist. A nodelist is harder to work with.

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
          }
        }
      }
    });

    // console.log("Create", this.id, this.element, this.elements);
  }

  addEventListeners() {}
  removeEventListeners() {}
}
