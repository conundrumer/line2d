import Map = require('./im/map');
import Set = require('./im/set');

import Line2D = require('./line2d');
import Point = require('./point');
import Line = require('./line');
import Vec = require('./vec');

// pls refactor
// http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
function sqr(x) { return x * x }
function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y) }
function distToSegmentSquared(p, v, w) {
  var l2 = dist2(v, w);
  if (l2 == 0) return dist2(p, v);
  var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  if (t < 0) return dist2(p, v);
  if (t > 1) return dist2(p, w);
  return dist2(p, { x: v.x + t * (w.x - v.x),
                    y: v.y + t * (w.y - v.y) });
}
function distToSegment(p, v, w) { return Math.sqrt(distToSegmentSquared(p, v, w)); }


interface PointLinesMap extends Map<Point.ID, Set<Line.ID>> {}
var PointLinesMap = () => Map<Point.ID, Set<Line.ID>>();

function toPointLinesSeq (linePointsMap: Map<Line.ID, Line.EndPoints>) {
    return linePointsMap.toSeq()
        .map<PointLinesMap>(toPointLinesMap)
        .reduce<PointLinesMap>(combinePointLinesMaps, PointLinesMap());
}
function toPointLinesMap (pq, lid) {
    var lines = Set<Line.ID>([lid]);
    return Map<Point.ID, Set<Line.ID>>([
        [pq.p, lines],
        [pq.q, lines]
    ]);
}
function combinePointLinesMaps (plMap1, plMap2) {
    return plMap1
        .mergeWith((lines1, lines2) => lines1.union(lines2), plMap2);
}

class Scene implements Line2D.Scene {
    private pointMethods: Line2D.Points;
    private lineMethods: Line2D.Lines;

    constructor(private _points: Point.Map, private _lines: Line.Map) {
        var oneOrMany = (oneFn, manyFn) =>
            (arr) => (arr instanceof Array)
                ? manyFn.call(this, arr)
                : oneFn.call(this, arr)

        var oneOrManyToArray = (oneFn, manyFn) =>
            (arr) => (arr instanceof Array)
                ? manyFn.call(this, arr)
                : [oneFn.call(this, arr)]

        this.pointMethods = {
            get: oneOrManyToArray(this.getPoint, this.getPoints),
            add: oneOrMany(this.addPoint, this.addPoints),
            remove: oneOrMany(this.removePoint, this.removePoints),
            selectInRadius: this.selectPointsInRadius.bind(this)
        };
        this.lineMethods = {
            get: oneOrManyToArray(this.getLine, this.getLines),
            add: oneOrMany(this.addLine, this.addLines),
            remove: oneOrMany(this.removeLine, this.removeLines),
            selectFromPoints: oneOrMany(
                this.selectLinesFromPoint,
                this.selectLinesFromPoints
            ),
            erase: oneOrMany(this.eraseLine, this.eraseLines),
            selectInRadius: this.selectLinesInRadius.bind(this)
        }
    }

    get points() {
        return this.pointMethods;
    }

    get lines() {
        return this.lineMethods;
    }

    toJSON(): Line2D.SceneObj {
        return {
            points: this._points.map( (point, id) => point.toJSON(id) ).toJS(),
            lines: this._lines.map( (line, id) => line.toJSON(id) ).toJS()
        };
    }

    private getPoint(pid: Point.ID): Line2D.PointObj {
        var point = this._points.get(pid);
        return point ? {
            id: pid,
            pos: point.xy
        } : null
    }

    private getPoints(pids: Array<Point.ID>): Array<Line2D.PointObj> {
        return pids.map(p => this.getPoint(p));
    }

    private getLine(lid: Line.ID): Line2D.LineObj {
        var line = this._lines.get(lid);
        return line ? {
            id: lid,
            pq: line.pq
        } : null
    }

    private getLines(lids: Array<Line.ID>): Array<Line2D.LineObj> {
        return lids.map(l => this.getLine(l));
    }

    private selectLinesFromPoint(pid: Point.ID): Array<Line.ID> {
        var point = this._points.get(pid);
        return point ? point.lines.toJS() : [];
    }

    private selectLinesFromPoints(pids: Array<Point.ID>): Array<Line.ID> {
        var noPoint = Point.create({x:0,y:0});
        return pids.map( p => this._points.get(p, noPoint).lines).reduce(
            (lines1, lines2) => lines1.union(lines2)
        ).toJS();
    }

    private addPoint(point: Line2D.PointObj): Scene {
        var points = this._points.set(point.id, Point.create(point.pos));
        return new Scene(points, this._lines);
    }

    private addPoints(points: Array<Line2D.PointObj>): Scene {
        var newPoints = Map<Point.ID, Point>(
            points.map( p => [p.id, Point.create(p.pos)] )
        );
        return new Scene(this._points.merge(newPoints), this._lines);
    }

    private addLine(line: Line2D.LineObj): Scene {
        var points = this._points
            .update(line.pq.p, p => p.addLine(line.id))
            .update(line.pq.q, p => p.addLine(line.id));
        return new Scene(points, this._lines.set(line.id, Line.create(line.pq)));
    }

    private addLines(lines: Array<Line2D.LineObj>): Scene {
        var linePointsMap = Map<Line.ID, Line.EndPoints>(
            lines.map( l => [l.id, l.pq] )
        );

        var updatedPoints: Point.Map = toPointLinesSeq(linePointsMap)
            .map<Point>( (lines, pid) => this._points.get(pid).addLines(lines) )
            .toMap();

        var newLines = linePointsMap.map<Line>(Line.create);

        return new Scene(
            this._points.merge(updatedPoints),
            this._lines.merge(newLines)
        );
    }

    private removeLine(lid: Line.ID): Scene {
        var pq = this._lines.get(lid).pq;
        var points = this._points
            .update(pq.p, p => p.removeLine(lid))
            .update(pq.q, p => p.removeLine(lid));
        return new Scene(points, this._lines.remove(lid));
    }

    private removeLines(lids: Array<Line.ID>): Scene {
        var linePointsMap = Map<Line.ID, Line.EndPoints>(lids.map(lid =>
            [lid, this._lines.get(lid)]
        ));

        var updatedPoints: Point.Map = toPointLinesSeq(linePointsMap)
            .map<Point>( (lines, pid) => this._points.get(pid).removeLines(lines) )
            .toMap();

        // maps don't have subtract/difference so...
        var lines = this._lines.withMutations(map =>
            lids.forEach(lid => map.remove(lid))
        );

        return new Scene(this._points.merge(updatedPoints), lines);
    }

    private removePoint(pid: Point.ID): Scene {
        var point = this._points.get(pid);

        var scene = this.removeLines(point.lines.toJS());

        return new Scene(scene._points.remove(pid), scene._lines);
    }

    private removePoints(pids: Array<Point.ID>): Scene {
        var lines = pids
            .map(pid => this._points.get(pid).lines)
            .reduce( (lines1, lines2) => lines1.union(lines2) )

        var scene = this.removeLines(lines.toJS());

        // maps don't have subtract/difference so...
        var points = scene._points.withMutations( map =>
            pids.forEach(pid => map.remove(pid))
        );

        return new Scene(points, scene._lines);
    }

    private eraseLine(lid: Line.ID): Scene {
        var pq = this._lines.get(lid).pq;
        var points = this._points
            .update(pq.p, p => p.removeLine(lid))
            .update(pq.q, p => p.removeLine(lid));
        points = points.get(pq.p).lines.count() > 0 ? points
            : points.remove(pq.p);
        points = points.get(pq.q).lines.count() > 0 ? points
            : points.remove(pq.q);
        return new Scene(points, this._lines.remove(lid));
    }

    private eraseLines(lids: Array<Line.ID>): Scene {
        var linePointsMap = Map<Line.ID, Line.EndPoints>(lids.map(lid =>
            [lid, this._lines.get(lid)]
        ));

        var pointLinesSeq = toPointLinesSeq(linePointsMap);

        var updatedPoints: Point.Map = pointLinesSeq
            .map<Point>( (lines, pid) => this._points.get(pid).removeLines(lines) )
            .toMap();

        var points = this._points.merge(updatedPoints);

        points = points.withMutations(map =>
            pointLinesSeq.forEach((_, pid) =>
                updatedPoints.get(pid).lines.count() > 0 ? null
                : map.remove(pid)
            )
        );

        // maps don't have subtract/difference so...
        var lines = this._lines.withMutations(map =>
            lids.forEach(lid => map.remove(lid))
        );

        return new Scene(points, lines);
    }

    private selectPointsInRadius(pos, r) {
        var dist = (p) => {
            var x = p.x - pos.x;
            var y = p.y - pos.y;
            return x*x + y*y
        }
        return this._points
            .toKeyedSeq()
            .map<number>(dist)
            .filter( d => d < r*r )
            .sort()
            .map<Point.ID>( (_,id) => id )
            .toArray();
    }

    private selectLinesInRadius(pos, r) {
        return this._lines
            .toKeyedSeq()
            .map<number>(line =>
                distToSegmentSquared(pos,
                    this._points.get(line.p).xy,
                    this._points.get(line.q).xy
                )
            )
            .filter( d => d < r*r )
            .sort()
            .map<Line.ID> ( (_, id) => id )
            .toArray();
    }
}

module Scene {
    export function create(): Scene {
        return new Scene(Point.Map(), Line.Map());
    }
}

export = Scene;
