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

    public toJS() : Line2D.SceneObj {
        return {
            points: this.points.map( point => point.xy ).toJS(),
            lines: this.lines.map( line => line.pq ).toJS()
        };
    }

    public addPoint(id: Point.ID, pos: Vec.Tuple): Scene {
        return new Scene(this.points.set(id, Point.create(pos)), this.lines);
    }

    public addPoints(points: Line2D.PointsObj) : Scene {
        var newPoints = Map<Point.ID, Vec.Obj>(points).map(v =>
            Point.create([v.x, v.y])
        );
        return new Scene(
            this.points.merge(newPoints),
            this.lines
        );
    }

    public addLine(lid: Line.ID, pids: [Point.ID, Point.ID]): Scene {
        var points = this.points
            .update(pids[0], p => p.addLine(lid))
            .update(pids[1], p => p.addLine(lid))
        return new Scene(points, this.lines.set(lid, Line.create(pids)));
    }

    public addLines(lines: Line2D.LinesObj) : Scene {
        var linePointsMap = Map<Line.ID, Line.EndPoints>(lines);

        var updatedPoints: Point.Map = toPointLinesSeq(linePointsMap)
            .map<Point>( (lines, pid) => this.points.get(pid).addLines(lines) )
            .toMap();

        var newLines = linePointsMap.map<Line>(pq =>
            Line.create([pq.p, pq.q])
        );

        return new Scene(
            this.points.merge(updatedPoints),
            this.lines.merge(newLines)
        );
    }

    public removeLine(lid: Line.ID): Scene {
        var pq = this.lines.get(lid).pq;
        var points = this.points
            .update(pq.p, p => p.removeLine(lid))
            .update(pq.q, p => p.removeLine(lid));
        return new Scene(points, this.lines.remove(lid));
    }

    public removeLines(lids: Line.ID[]): Scene {
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

    public removePoint(pid: Point.ID): Scene {
        var point = this.points.get(pid);

        var scene = this.removeLines(point.lines.toJS());

        return new Scene(scene.points.remove(pid), scene.lines);
    }

    public removePoints(pids: Point.ID[]): Scene {
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
}

module Scene {
    export function create(): Scene {
        return new Scene(Point.Map(), Line.Map());
    }
}

export = Scene;
