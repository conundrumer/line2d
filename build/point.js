var im = require('immutable');
var Set = require('./im/set');
var Point = (function () {
    function Point(pos, lineSet) {
        this.pos = pos;
        this.lineSet = lineSet;
    }
    Object.defineProperty(Point.prototype, "x", {
        get: function () {
            return this.pos[0];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Point.prototype, "y", {
        get: function () {
            return this.pos[1];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Point.prototype, "xy", {
        get: function () {
            return {
                x: this.pos[0],
                y: this.pos[1]
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Point.prototype, "lines", {
        get: function () {
            return this.lineSet;
        },
        enumerable: true,
        configurable: true
    });
    Point.prototype.addLine = function (lid) {
        return new Point(this.pos, this.lineSet.add(lid));
    };
    Point.prototype.addLines = function (lids) {
        return new Point(this.pos, this.lineSet.union(lids));
    };
    Point.prototype.removeLine = function (lid) {
        return new Point(this.pos, this.lineSet.remove(lid));
    };
    Point.prototype.removeLines = function (lids) {
        return new Point(this.pos, this.lineSet.subtract(lids));
    };
    return Point;
})();
var Point;
(function (Point) {
    Point.Map = function (a) { return im.Map(a); };
    function create(pos) {
        return new Point([pos.x, pos.y], Set());
    }
    Point.create = create;
})(Point || (Point = {}));
module.exports = Point;
