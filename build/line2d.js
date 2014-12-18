var Scene = require('./scene');
var Line2D;
(function (Line2D) {
    function toPoints(pointProps) {
        return pointProps.map(function (p) {
            return {
                id: p[0],
                pos: {
                    x: p[1][0],
                    y: p[1][1]
                }
            };
        });
    }
    Line2D.toPoints = toPoints;
    function toLines(lineProps) {
        return lineProps.map(function (l) {
            return {
                id: l[0],
                pq: {
                    p: l[1][0],
                    q: l[1][1]
                }
            };
        });
    }
    Line2D.toLines = toLines;
    function newScene() {
        return Scene.create();
    }
    Line2D.newScene = newScene;
})(Line2D || (Line2D = {}));
// https://github.com/umdjs/umd
if (typeof module === "object" && module.exports) {
    // CommonJS (Node)
    module.exports = Line2D;
}
else if (typeof define === "function" && define.amd) {
    // AMD
    define(function () {
        return Line2D;
    });
}
else {
    window['Line2D'] = Line2D;
}
module.exports = Line2D;
