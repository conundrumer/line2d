///<reference path='../node_modules/immutable/dist/Immutable.d.ts'/>
import Immutable = require('immutable');
import point = require('./point');
import line = require('./line');

export interface Line extends line.Line {}
export interface Point extends point.Point {}

var Map = Immutable.Map;
var Set = Immutable.Set;

var Point = point.Point;
var Line = line.Line;

var newPoint = point.newPoint;
var newLine = line.newLine;

export type LineID = string;
export type PointID = string;
export type TupleVec = [number, number];

export interface Map<K,V> extends Immutable.Map<K,V> {}
export interface Set<V> extends Immutable.Set<V> {}
export interface PointMap extends Map<PointID, Point> {}
export interface LineMap extends Map<LineID, Line> {}

export interface ObjVec { x: number; y: number; }
export interface EndPoints { p: PointID; q: PointID; }

export interface PointsObj { [pid: string] : ObjVec }
export interface LinesObj { [lid: string] : EndPoints }
export interface SceneObj { points: PointsObj; lines: LinesObj; }

interface PointLinesMap extends Map<PointID, Set<LineID>> {}
function toPointLinesMap (endPoints, lid) {
    var lines = Set<LineID>([lid]);
    return Map<PointID, Set<LineID>>()
        .set(endPoints.p, lines)
        .set(endPoints.q, lines);
}
function combinePointLinesMaps (pMap, qMap) {
    var setUnion = (pLines, qLines) => pLines.union(qLines)
    return pMap.mergeWith(setUnion, qMap);
}
function toPointLinesSeq (lineMap: Map<LineID, EndPoints>) {
    var empty: PointLinesMap = Map<PointID, Set<LineID>>();
    return lineMap.toSeq()
        .map<PointLinesMap>(toPointLinesMap)
        .reduce<PointLinesMap>(combinePointLinesMaps, empty)
}

export class Scene {
    constructor(public points: PointMap, public lines: LineMap) { }

    public toJS() : SceneObj {
        return {
            points: this.points.map( point => point.xy ).toJS(),
            lines: this.lines.map( line => line.pq ).toJS()
        };
    }

    public addPoint(id: PointID, pos: TupleVec): Scene {
        return new Scene(this.points.set(id, newPoint(pos)), this.lines);
    }

    public addPoints(points: PointsObj) : Scene {
        var newPoints = Map(points).map(p => newPoint([p.x, p.y]));
        return new Scene(
            this.points.merge(newPoints),
            this.lines
        );
    }

    public addLine(lid: LineID, pids: [PointID, PointID]): Scene {
        var points = this.points
            .update(pids[0], p => p.addLine(lid))
            .update(pids[1], p => p.addLine(lid))
        return new Scene(points, this.lines.set(lid, newLine(pids)));
    }

    public addLines(lines: LinesObj) : Scene {
        var lineMap = Map<LineID, EndPoints>(lines);

        var updatedPoints: PointMap = toPointLinesSeq(lineMap)
            .map<Point>( (lines, pid) => this.points.get(pid).addLines(lines) )
            .toMap();

        var newLines = lineMap.map<Line>(line => newLine([line.p, line.q]));

        return new Scene(
            this.points.merge(updatedPoints),
            this.lines.merge(newLines)
        );
    }

    public removeLine(lid: LineID): Scene {
        var endPoints = this.lines.get(lid).pq;
        var points = this.points
            .update(endPoints.p, p => p.removeLine(lid))
            .update(endPoints.q, p => p.removeLine(lid));
        return new Scene(points, this.lines.remove(lid));
    }

    public removeLines(lids: LineID[]): Scene {
        var lineMap = Map<LineID, Line>(lids.map(lid =>
            [lid, this.lines.get(lid).pq]
        ));

        var updatedPoints: PointMap = toPointLinesSeq(lineMap)
            .map<Point>( (lines, pid) => this.points.get(pid).removeLines(lines) )
            .toMap();

        // maps don't have subtract/difference so...
        var lines = this.lines.withMutations(map =>
            lids.forEach(lid => map.remove(lid))
        );

        return new Scene(this.points.merge(updatedPoints), lines);
    }

    public removePoint(pid: PointID): Scene {
        var point = this.points.get(pid);

        var scene = this.removeLines(point.lines.toJS());

        return new Scene(scene.points.remove(pid), scene.lines);
    }

    public removePoints(pids: PointID[]): Scene {
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
