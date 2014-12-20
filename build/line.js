var im = require('immutable');
var Line = (function () {
    function Line(pids) {
        this.pids = pids;
    }
    Line.prototype.toJSON = function (id) {
        return {
            id: id,
            pq: this.pq
        };
    };
    Object.defineProperty(Line.prototype, "p", {
        get: function () {
            return this.pids[0];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "q", {
        get: function () {
            return this.pids[1];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Line.prototype, "pq", {
        get: function () {
            return {
                p: this.pids[0],
                q: this.pids[1]
            };
        },
        enumerable: true,
        configurable: true
    });
    return Line;
})();
var Line;
(function (Line) {
    Line.Map = function (a) { return im.Map(a); };
    function create(pq) {
        return new Line([pq.p, pq.q]);
    }
    Line.create = create;
})(Line || (Line = {}));
module.exports = Line;
