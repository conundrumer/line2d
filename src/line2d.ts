module Line2D {
  export var NAME = "Line2D";

  export function hi() {
    console.log("hello")
  }
}

declare var module;
declare var define;
interface Window { Line2D: any; }

// https://github.com/umdjs/umd
if (typeof module === "object" && module.exports) {
  // CommonJS (Node)
  module.exports = Line2D;
} else if (typeof define === "function" && define.amd) {
  // AMD
  define(function () { return Line2D; });
} else {
  window.Line2D = Line2D;
}
