var Map = require('./im/map');
var Set = require('./im/set');
var Point = require('./point');
var Line = require('./line');
function dict() {
    return Object.create(null);
}
// pls refactor
// http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
function sqr(x) {
    return x * x;
}
function dist2(v, w) {
    return sqr(v.x - w.x) + sqr(v.y - w.y);
}
function distToSegmentSquared(p, v, w) {
    var l2 = dist2(v, w);
    if (l2 == 0)
        return dist2(p, v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    if (t < 0)
        return dist2(p, v);
    if (t > 1)
        return dist2(p, w);
    return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
}
function distToSegment(p, v, w) {
    return Math.sqrt(distToSegmentSquared(p, v, w));
}
var PointLinesMap = function () { return Map(); };
function toPointLinesSeq(linePointsMap) {
    return linePointsMap.toSeq().map(toPointLinesMap).reduce(combinePointLinesMaps, PointLinesMap());
}
function toPointLinesMap(pq, lid) {
    var lines = Set([lid]);
    return Map([
        [pq.p, lines],
        [pq.q, lines]
    ]);
}
function combinePointLinesMaps(plMap1, plMap2) {
    return plMap1.mergeWith(function (lines1, lines2) { return lines1.union(lines2); }, plMap2);
}
var Scene = (function () {
    function Scene(_points, _lines) {
        var _this = this;
        this._points = _points;
        this._lines = _lines;
        var oneOrMany = function (oneFn, manyFn) { return function (arr) { return (arr instanceof Array) ? manyFn.call(_this, arr) : oneFn.call(_this, arr); }; };
        // var oneOrManyToArray = (oneFn, manyFn) =>
        //     (arr) => (arr instanceof Array)
        //         ? manyFn.call(this, arr)
        //         : [oneFn.call(this, arr)]
        this.pointMethods = {
            get: oneOrMany(this.getPoint, this.getPoints),
            add: oneOrMany(this.addPoint, this.addPoints),
            remove: oneOrMany(this.removePoint, this.removePoints),
            selectInRadius: this.selectPointsInRadius.bind(this)
        };
        this.lineMethods = {
            get: oneOrMany(this.getLine, this.getLines),
            add: oneOrMany(this.addLine, this.addLines),
            remove: oneOrMany(this.removeLine, this.removeLines),
            selectFromPoints: oneOrMany(this.selectLinesFromPoint, this.selectLinesFromPoints),
            erase: oneOrMany(this.eraseLine, this.eraseLines),
            selectInRadius: this.selectLinesInRadius.bind(this)
        };
    }
    Object.defineProperty(Scene.prototype, "points", {
        get: function () {
            return this.pointMethods;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Scene.prototype, "lines", {
        get: function () {
            return this.lineMethods;
        },
        enumerable: true,
        configurable: true
    });
    Scene.prototype.toJSON = function () {
        return {
            points: this._points.map(function (point, id) { return point.toJSON(id); }).toJS(),
            lines: this._lines.map(function (line, id) { return line.toJSON(id); }).toJS()
        };
    };
    Scene.prototype.getPoint = function (pid) {
        var point = this._points.get(pid);
        if (point) {
            var out = dict();
            out[pid] = point.toJSON(pid);
            return out;
        }
        return dict();
    };
    Scene.prototype.getPoints = function (pids) {
        var _this = this;
        var out = dict();
        pids.forEach(function (pid) {
            var point = _this._points.get(pid);
            if (point)
                out[pid] = point.toJSON(pid);
        });
        return out;
    };
    Scene.prototype.getLine = function (lid) {
        var line = this._lines.get(lid);
        if (line) {
            var out = dict();
            out[lid] = line.toJSON(lid);
            return out;
        }
        return dict();
    };
    Scene.prototype.getLines = function (lids) {
        var _this = this;
        var out = dict();
        lids.forEach(function (lid) {
            var line = _this._lines.get(lid);
            if (line)
                out[lid] = line.toJSON(lid);
        });
        return out;
    };
    Scene.prototype.selectLinesFromPoint = function (pid) {
        var point = this._points.get(pid);
        return point ? point.lines.toJS() : [];
    };
    Scene.prototype.selectLinesFromPoints = function (pids) {
        var _this = this;
        var noPoint = Point.create({ x: 0, y: 0 });
        return pids.map(function (p) { return _this._points.get(p, noPoint).lines; }).reduce(function (lines1, lines2) { return lines1.union(lines2); }).toJS();
    };
    Scene.prototype.addPoint = function (point) {
        var points = this._points.set(point.id, Point.create(point.pos));
        return new Scene(points, this._lines);
    };
    Scene.prototype.addPoints = function (points) {
        var newPoints = Map(points.map(function (p) { return [p.id, Point.create(p.pos)]; }));
        return new Scene(this._points.merge(newPoints), this._lines);
    };
    Scene.prototype.addLine = function (line) {
        var points = this._points.update(line.pq.p, function (p) { return p.addLine(line.id); }).update(line.pq.q, function (p) { return p.addLine(line.id); });
        return new Scene(points, this._lines.set(line.id, Line.create(line.pq)));
    };
    Scene.prototype.addLines = function (lines) {
        var _this = this;
        var linePointsMap = Map(lines.map(function (l) { return [l.id, l.pq]; }));
        var updatedPoints = toPointLinesSeq(linePointsMap).map(function (lines, pid) { return _this._points.get(pid).addLines(lines); }).toMap();
        var newLines = linePointsMap.map(Line.create);
        return new Scene(this._points.merge(updatedPoints), this._lines.merge(newLines));
    };
    Scene.prototype.removeLine = function (lid) {
        var pq = this._lines.get(lid).pq;
        var points = this._points.update(pq.p, function (p) { return p.removeLine(lid); }).update(pq.q, function (p) { return p.removeLine(lid); });
        return new Scene(points, this._lines.remove(lid));
    };
    Scene.prototype.removeLines = function (lids) {
        var _this = this;
        var linePointsMap = Map(lids.map(function (lid) { return [lid, _this._lines.get(lid)]; }));
        var updatedPoints = toPointLinesSeq(linePointsMap).map(function (lines, pid) { return _this._points.get(pid).removeLines(lines); }).toMap();
        // maps don't have subtract/difference so...
        var lines = this._lines.withMutations(function (map) { return lids.forEach(function (lid) { return map.remove(lid); }); });
        return new Scene(this._points.merge(updatedPoints), lines);
    };
    Scene.prototype.removePoint = function (pid) {
        var point = this._points.get(pid);
        var scene = this.removeLines(point.lines.toJS());
        return new Scene(scene._points.remove(pid), scene._lines);
    };
    Scene.prototype.removePoints = function (pids) {
        var _this = this;
        var lines = pids.map(function (pid) { return _this._points.get(pid).lines; }).reduce(function (lines1, lines2) { return lines1.union(lines2); });
        var scene = this.removeLines(lines.toJS());
        // maps don't have subtract/difference so...
        var points = scene._points.withMutations(function (map) { return pids.forEach(function (pid) { return map.remove(pid); }); });
        return new Scene(points, scene._lines);
    };
    Scene.prototype.eraseLine = function (lid) {
        var pq = this._lines.get(lid).pq;
        var points = this._points.update(pq.p, function (p) { return p.removeLine(lid); }).update(pq.q, function (p) { return p.removeLine(lid); });
        points = points.get(pq.p).lines.count() > 0 ? points : points.remove(pq.p);
        points = points.get(pq.q).lines.count() > 0 ? points : points.remove(pq.q);
        return new Scene(points, this._lines.remove(lid));
    };
    Scene.prototype.eraseLines = function (lids) {
        var _this = this;
        var linePointsMap = Map(lids.map(function (lid) { return [lid, _this._lines.get(lid)]; }));
        var pointLinesSeq = toPointLinesSeq(linePointsMap);
        var updatedPoints = pointLinesSeq.map(function (lines, pid) { return _this._points.get(pid).removeLines(lines); }).toMap();
        var points = this._points.merge(updatedPoints);
        points = points.withMutations(function (map) { return pointLinesSeq.forEach(function (_, pid) { return updatedPoints.get(pid).lines.count() > 0 ? null : map.remove(pid); }); });
        // maps don't have subtract/difference so...
        var lines = this._lines.withMutations(function (map) { return lids.forEach(function (lid) { return map.remove(lid); }); });
        return new Scene(points, lines);
    };
    Scene.prototype.selectPointsInRadius = function (pos, r) {
        var dist = function (p) {
            var x = p.x - pos.x;
            var y = p.y - pos.y;
            return x * x + y * y;
        };
        return this._points.toKeyedSeq().map(dist).filter(function (d) { return d < r * r; }).sort().map(function (_, id) { return id; }).toArray();
    };
    Scene.prototype.selectLinesInRadius = function (pos, r) {
        var _this = this;
        return this._lines.toKeyedSeq().map(function (line) { return distToSegmentSquared(pos, _this._points.get(line.p).xy, _this._points.get(line.q).xy); }).filter(function (d) { return d < r * r; }).sort().map(function (_, id) { return id; }).toArray();
    };
    return Scene;
})();
var Scene;
(function (Scene) {
    function create() {
        return new Scene(Point.Map(), Line.Map());
    }
    Scene.create = create;
})(Scene || (Scene = {}));
module.exports = Scene;
