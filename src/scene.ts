import Map = require('./im/map');
import Set = require('./im/set');

import Line2D = require('./line2d');
import Point = require('./point');
import Line = require('./line');
import Vec = require('./vec');

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
    constructor(private points: Point.Map, private lines: Line.Map) { }

    toJS() : Line2D.SceneObj {
        return {
            points: this.points.map( point => point.xy ).toJS(),
            lines: this.lines.map( line => line.pq ).toJS()
        };
    }

    getPoint(pid: Point.ID): Line2D.PointObj {
        var point = this.points.get(pid);
        return point ? {
            id: pid,
            pos: point.xy
        } : null
    }

    getPoints(pids: Array<Point.ID>): Array<Line2D.PointObj> {
        return pids.map(p => this.getPoint(p));
    }

    getLine(lid: Line.ID): Line2D.LineObj {
        var line = this.lines.get(lid);
        return line ? {
            id: lid,
            pq: line.pq
        } : null
    }

    getLines(lids: Array<Line.ID>): Array<Line2D.LineObj> {
        return lids.map(l => this.getLine(l));
    }

    getLinesFromPoint(pid: Point.ID): Array<Line.ID> {
        var point = this.points.get(pid);
        return point ? point.lines.toJS() : [];
    }

    getLinesFromPoints(pids: Array<Point.ID>): Array<Line.ID> {
        var noPoint = Point.create({x:0,y:0});
        return pids.map( p => this.points.get(p, noPoint).lines).reduce(
            (lines1, lines2) => lines1.union(lines2)
        ).toJS();
    }

    addPoint(point: Line2D.PointObj): Scene {
        var points = this.points.set(point.id, Point.create(point.pos));
        return new Scene(points, this.lines);
    }

    addPoints(points: Array<Line2D.PointObj>) : Scene {
        var newPoints = Map<Point.ID, Point>(
            points.map( p => [p.id, Point.create(p.pos)] )
        );
        return new Scene(this.points.merge(newPoints), this.lines);
    }

    addLine(line: Line2D.LineObj): Scene {
        var points = this.points
            .update(line.pq.p, p => p.addLine(line.id))
            .update(line.pq.q, p => p.addLine(line.id));
        return new Scene(points, this.lines.set(line.id, Line.create(line.pq)));
    }

    addLines(lines: Array<Line2D.LineObj>) : Scene {
        var linePointsMap = Map<Line.ID, Line.EndPoints>(
            lines.map( l => [l.id, l.pq] )
        );

        var updatedPoints: Point.Map = toPointLinesSeq(linePointsMap)
            .map<Point>( (lines, pid) => this.points.get(pid).addLines(lines) )
            .toMap();

        var newLines = linePointsMap.map<Line>(Line.create);

        return new Scene(
            this.points.merge(updatedPoints),
            this.lines.merge(newLines)
        );
    }

    removeLine(lid: Line.ID): Scene {
        var pq = this.lines.get(lid).pq;
        var points = this.points
            .update(pq.p, p => p.removeLine(lid))
            .update(pq.q, p => p.removeLine(lid));
        return new Scene(points, this.lines.remove(lid));
    }

    removeLines(lids: Array<Line.ID>): Scene {
        var linePointsMap = Map<Line.ID, Line.EndPoints>(lids.map(lid =>
            [lid, this.lines.get(lid)]
        ));

        var updatedPoints: Point.Map = toPointLinesSeq(linePointsMap)
            .map<Point>( (lines, pid) => this.points.get(pid).removeLines(lines) )
            .toMap();

        // maps don't have subtract/difference so...
        var lines = this.lines.withMutations(map =>
            lids.forEach(lid => map.remove(lid))
        );

        return new Scene(this.points.merge(updatedPoints), lines);
    }

    removePoint(pid: Point.ID): Scene {
        var point = this.points.get(pid);

        var scene = this.removeLines(point.lines.toJS());

        return new Scene(scene.points.remove(pid), scene.lines);
    }

    removePoints(pids: Array<Point.ID>): Scene {
        var lines = pids
            .map(pid => this.points.get(pid).lines)
            .reduce( (lines1, lines2) => lines1.union(lines2) )

        var scene = this.removeLines(lines.toJS());

        // maps don't have subtract/difference so...
        var points = scene.points.withMutations( map =>
            pids.forEach(pid => map.remove(pid))
        );

        return new Scene(points, scene.lines);
    }

    eraseLine(lid: Line.ID): Scene {
        var pq = this.lines.get(lid).pq;
        var points = this.points
            .update(pq.p, p => p.removeLine(lid))
            .update(pq.q, p => p.removeLine(lid));
        points = points.get(pq.p).lines.count() > 0 ? points
            : points.remove(pq.p);
        points = points.get(pq.q).lines.count() > 0 ? points
            : points.remove(pq.q);
        return new Scene(points, this.lines.remove(lid));
    }

    eraseLines(lids: Array<Line.ID>): Scene {
        var linePointsMap = Map<Line.ID, Line.EndPoints>(lids.map(lid =>
            [lid, this.lines.get(lid)]
        ));

        var pointLinesSeq = toPointLinesSeq(linePointsMap);

        var updatedPoints: Point.Map = pointLinesSeq
            .map<Point>( (lines, pid) => this.points.get(pid).removeLines(lines) )
            .toMap();

        var points = this.points.merge(updatedPoints);

        points = points.withMutations(map =>
            pointLinesSeq.forEach((_, pid) =>
                updatedPoints.get(pid).lines.count() > 0 ? null
                : map.remove(pid)
            )
        );

        // maps don't have subtract/difference so...
        var lines = this.lines.withMutations(map =>
            lids.forEach(lid => map.remove(lid))
        );

        return new Scene(points, lines);
    }
}

module Scene {
    export function create(): Scene {
        return new Scene(Point.Map(), Line.Map());
    }
}

export = Scene;
