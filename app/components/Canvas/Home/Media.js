import GSAP from "gsap";

import { Mesh, Program } from "ogl";

export default class {
  constructor({ element, geometry, gl, index, scene, sizes }) {
    this.element = element;
    this.geometry = geometry;
    this.gl = gl;
    this.index = index;
    this.scene = scene;
    this.sizes = sizes;
    this.createTexture();
    this.createProgram();
    this.createMesh();
    this.extra = { x: 0, y: 0 };
  }

  createTexture() {
    const image = this.element;
    this.texture = window.TEXTURES[image.getAttribute("data-src")];
  }
  createProgram() {
    this.program = new Program(this.gl, {
      vertex: `
      attribute vec3 position;
      attribute vec2 uv;

      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;

      varying vec2 vUv;

      void main() {
        vUv = uv;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }

      `,
      fragment: `
      precision highp float;

      uniform float uAlpha;
      uniform sampler2D tMap;

      varying vec2 vUv;

      void main() {
        vec4 texture = texture2D(tMap, vUv);

        gl_FragColor = texture;
        gl_FragColor.a = uAlpha;
      }

      `,
      uniforms: { tMap: { value: this.texture }, uAlpha: { value: 0 } },
    });
  }

  createMesh() {
    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });

    this.mesh.setParent(this.scene);

    this.mesh.rotation.z = GSAP.utils.random(-Math.PI * 0.02, Math.PI * 0.02);
  }
  createBounds({ sizes }) {
    this.sizes = sizes;
    this.bounds = this.element.getBoundingClientRect();

    this.updateScale(sizes);
    this.updateX();
    this.updateY();
    // console.log(this.bounds);
  }

  // Animating in and out

  show() {
    GSAP.fromTo(
      this.program.uniforms.uAlpha,
      {
        value: 0,
      },
      {
        value: 1,
      }
    );
  }

  hide() {
    GSAP.to(this.program.uniforms.uAlpha, {
      value: 0,
    });
  }

  // Events
  onResize(sizes, scroll) {
    this.extra = { x: 0, y: 0 };

    this.createBounds(sizes);
    this.updateX(scroll && scroll.x);
    this.updateY(scroll && scroll.y);
  }

  // Loop
  updateScale() {
    // Calculate the height and width ratios relative to the window size
    this.height = this.bounds.height / window.innerHeight;
    this.width = this.bounds.width / window.innerWidth;

    // Update the mesh scale based on the calculated width and height
    this.mesh.scale.x = this.sizes.width * this.width;
    this.mesh.scale.y = this.sizes.height * this.height;
  }

  updateX(x = 0) {
    // this merely gives us the ratio of the distance of the mesh on the x-axis relative to the window width.(like left 30px but we want to know the ratio of 30px to the window width). We still have to multiply it by the size given by the camera to get the left distance of the mesh.
    this.x = (this.bounds?.left + x) / window.innerWidth;

    // This helps translate the positioning of the mesh to a 3D space.
    // We take into condiration the width of the scene given by the camera, the widht of the mesh (divided by 2 to center it) and the left positioning.
    this.mesh.position.x =
      -this.sizes.width / 2 +
      this.mesh.scale.x / 2 +
      this.x * this.sizes.width +
      this.extra.x;
  }

  updateY(y = 0) {
    this.y = (this.bounds?.top + y) / window.innerHeight;

    this.mesh.position.y =
      this.sizes.height / 2 -
      this.mesh.scale.y / 2 -
      this.y * this.sizes.height +
      this.extra.y;
  }

  update(scroll) {
    if (!this.bounds) return;
    this.updateX(scroll.x);
    this.updateY(scroll.y);
  }
}
