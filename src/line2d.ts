///<reference path='../node_modules/immutable/dist/Immutable.d.ts'/>
import Immutable = require('immutable');

module Line2D {
    var Map = Immutable.Map;
    var Set = Immutable.Set;

    type LineID = string;
    type PointID = string;
    type TupleVec = [number, number];

    interface Map<K,V> extends Immutable.Map<K,V> {}
    interface Set<V> extends Immutable.Set<V> {}
    interface PointMap extends Map<PointID, Point> {}
    interface LineMap extends Map<LineID, Line> {}

    export interface ObjVec { x: number; y: number; }
    export interface EndPoints { p: PointID; q: PointID; }

    class Point {
        constructor(private pos: TupleVec, private lineSet: Set<LineID>) { }

        get x() : number { return this.pos[0] }
        get y() : number { return this.pos[1] }

        get xy() : ObjVec { return { x: this.pos[0], y: this.pos[1] } }

        get lines() {
            return this.lineSet;
        }

        public addLine(lid: LineID) : Point {
            return new Point(this.pos, this.lineSet.add(lid));
        }

        public addLines(lids: Set<LineID>) : Point {
            return new Point(this.pos, this.lineSet.union(lids));
        }

        public removeLine(lid: LineID) : Point {
            return new Point(this.pos, this.lineSet.remove(lid));
        }

        public removeLines(lids: Set<LineID>) : Point {
            return new Point(this.pos, this.lineSet.subtract(lids));
        }
    }

    function newPoint (pos: TupleVec) : Point {
        return new Point(pos, Set<LineID>())
    }

    class Line {
        constructor(private pids: [PointID, PointID]) { }

        get p() : PointID { return this.pids[0] }
        get q() : PointID { return this.pids[1] }

        get pq() : EndPoints { return { p: this.pids[0], q: this.pids[1] }; }
    }

    function newLine(pids: [PointID, PointID]) : Line {
        return new Line(pids);
    }

    export interface PointsObj { [pid: string] : ObjVec }
    export interface LinesObj { [lid: string] : EndPoints }
    export interface SceneObj { points: PointsObj; lines: LinesObj; }

    export function toPoints(pointProps: [PointID, TupleVec][]) : PointsObj {
        var points: PointsObj = {};
        pointProps.forEach( p => {
            points[p[0]] = { x: p[1][0], y: p[1][1] };
        });
        return points;
    }

    export function toLines(lineProps: [LineID, [PointID, PointID]][]) : LinesObj {
        var lines: LinesObj = {};
        lineProps.forEach( l => {
            lines[l[0]] = { p: l[1][0], q: l[1][1] };
        });
        return lines;
    }

    export function newScene() : Scene {
        return new Scene(Map<PointID, Point>(), Map<LineID, Line>());
    }

    export function makeSceneFromJS(scene: SceneObj) : Scene {
        return newScene().addPoints(scene.points).addLines(scene.lines);
    }

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

    class Scene {
        constructor(private points: PointMap, private lines: LineMap) { }

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
}

declare var module;
declare var define;
interface Window { Line2D: any; }

// https://github.com/umdjs/umd
if (typeof module === "object" && module.exports) {
    // CommonJS (Node)
    module.exports = Line2D;
} else if (typeof define === "function" && define.amd) {
    // AMD
    define(function () { return Line2D; });
} else {
    // window.Line2D = Line2D;
}
