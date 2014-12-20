var Scene = require('./scene');
var Line2D;
(function (Line2D) {
    function toPoint(p) {
        return {
            id: p[0],
            pos: {
                x: p[1][0],
                y: p[1][1]
            }
        };
    }
    Line2D.toPoint = toPoint;
    function toLine(l) {
        return {
            id: l[0],
            pq: {
                p: l[1][0],
                q: l[1][1]
            }
        };
    }
    Line2D.toLine = toLine;
    function newScene() {
        return Scene.create();
    }
    Line2D.newScene = newScene;
    function makeSceneFromJSON(s) {
        var points = Object.keys(s.points).map(function (id) { return s.points[id]; });
        var lines = Object.keys(s.lines).map(function (id) { return s.lines[id]; });
        return Scene.create().points.add(points).lines.add(lines);
    }
    Line2D.makeSceneFromJSON = makeSceneFromJSON;
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
