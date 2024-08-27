import GSAP from "gsap";

class Colors {
  change({ backgroundColor, color }) {
    GSAP.to(document.documentElement, {
      background: backgroundColor,
      color,
      duration: 1.5,
    });
  }
}

// Classic example of singleton pattern
export const ColorsManager = new Colors();
