var Map = require('./im/map');
var Set = require('./im/set');
var Point = require('./point');
var Line = require('./line');
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
    function Scene(points, lines) {
        this.points = points;
        this.lines = lines;
    }
    Scene.prototype.toJS = function () {
        return {
            points: this.points.map(function (point) { return point.xy; }).toJS(),
            lines: this.lines.map(function (line) { return line.pq; }).toJS()
        };
    };
    Scene.prototype.getPoint = function (pid) {
        var point = this.points.get(pid);
        return point ? {
            id: pid,
            pos: point.xy
        } : null;
    };
    Scene.prototype.getPoints = function (pids) {
        var _this = this;
        return pids.map(function (p) { return _this.getPoint(p); });
    };
    Scene.prototype.getLine = function (lid) {
        var line = this.lines.get(lid);
        return line ? {
            id: lid,
            pq: line.pq
        } : null;
    };
    Scene.prototype.getLines = function (lids) {
        var _this = this;
        return lids.map(function (l) { return _this.getLine(l); });
    };
    Scene.prototype.getLinesFromPoint = function (pid) {
        var point = this.points.get(pid);
        return point ? point.lines.toJS() : [];
    };
    Scene.prototype.getLinesFromPoints = function (pids) {
        var _this = this;
        var noPoint = Point.create({ x: 0, y: 0 });
        return pids.map(function (p) { return _this.points.get(p, noPoint).lines; }).reduce(function (lines1, lines2) { return lines1.union(lines2); }).toJS();
    };
    Scene.prototype.addPoint = function (point) {
        var points = this.points.set(point.id, Point.create(point.pos));
        return new Scene(points, this.lines);
    };
    Scene.prototype.addPoints = function (points) {
        var newPoints = Map(points.map(function (p) { return [p.id, Point.create(p.pos)]; }));
        return new Scene(this.points.merge(newPoints), this.lines);
    };
    Scene.prototype.addLine = function (line) {
        var points = this.points.update(line.pq.p, function (p) { return p.addLine(line.id); }).update(line.pq.q, function (p) { return p.addLine(line.id); });
        return new Scene(points, this.lines.set(line.id, Line.create(line.pq)));
    };
    Scene.prototype.addLines = function (lines) {
        var _this = this;
        var linePointsMap = Map(lines.map(function (l) { return [l.id, l.pq]; }));
        var updatedPoints = toPointLinesSeq(linePointsMap).map(function (lines, pid) { return _this.points.get(pid).addLines(lines); }).toMap();
        var newLines = linePointsMap.map(Line.create);
        return new Scene(this.points.merge(updatedPoints), this.lines.merge(newLines));
    };
    Scene.prototype.removeLine = function (lid) {
        var pq = this.lines.get(lid).pq;
        var points = this.points.update(pq.p, function (p) { return p.removeLine(lid); }).update(pq.q, function (p) { return p.removeLine(lid); });
        return new Scene(points, this.lines.remove(lid));
    };
    Scene.prototype.removeLines = function (lids) {
        var _this = this;
        var linePointsMap = Map(lids.map(function (lid) { return [lid, _this.lines.get(lid)]; }));
        var updatedPoints = toPointLinesSeq(linePointsMap).map(function (lines, pid) { return _this.points.get(pid).removeLines(lines); }).toMap();
        // maps don't have subtract/difference so...
        var lines = this.lines.withMutations(function (map) { return lids.forEach(function (lid) { return map.remove(lid); }); });
        return new Scene(this.points.merge(updatedPoints), lines);
    };
    Scene.prototype.removePoint = function (pid) {
        var point = this.points.get(pid);
        var scene = this.removeLines(point.lines.toJS());
        return new Scene(scene.points.remove(pid), scene.lines);
    };
    Scene.prototype.removePoints = function (pids) {
        var _this = this;
        var lines = pids.map(function (pid) { return _this.points.get(pid).lines; }).reduce(function (lines1, lines2) { return lines1.union(lines2); });
        var scene = this.removeLines(lines.toJS());
        // maps don't have subtract/difference so...
        var points = scene.points.withMutations(function (map) { return pids.forEach(function (pid) { return map.remove(pid); }); });
        return new Scene(points, scene.lines);
    };
    Scene.prototype.eraseLine = function (lid) {
        var pq = this.lines.get(lid).pq;
        var points = this.points.update(pq.p, function (p) { return p.removeLine(lid); }).update(pq.q, function (p) { return p.removeLine(lid); });
        points = points.get(pq.p).lines.count() > 0 ? points : points.remove(pq.p);
        points = points.get(pq.q).lines.count() > 0 ? points : points.remove(pq.q);
        return new Scene(points, this.lines.remove(lid));
    };
    Scene.prototype.eraseLines = function (lids) {
        var _this = this;
        var linePointsMap = Map(lids.map(function (lid) { return [lid, _this.lines.get(lid)]; }));
        var pointLinesSeq = toPointLinesSeq(linePointsMap);
        var updatedPoints = pointLinesSeq.map(function (lines, pid) { return _this.points.get(pid).removeLines(lines); }).toMap();
        var points = this.points.merge(updatedPoints);
        points = points.withMutations(function (map) { return pointLinesSeq.forEach(function (_, pid) { return updatedPoints.get(pid).lines.count() > 0 ? null : map.remove(pid); }); });
        // maps don't have subtract/difference so...
        var lines = this.lines.withMutations(function (map) { return lids.forEach(function (lid) { return map.remove(lid); }); });
        return new Scene(points, lines);
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
