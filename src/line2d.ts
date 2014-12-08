///<reference path='../node_modules/immutable/dist/Immutable.d.ts'/>
import im = require('immutable');

module Line2D {
    class Point {
        constructor(
            private pos: [number, number],
            private lines: im.Set<string>) { }

        get x() : number { return this.pos[0] }
        get y() : number { return this.pos[1] }

        get xy() : ObjVec2 { return { x: this.pos[0], y: this.pos[1] } }

        public addLine(lid: string) : Point {
            return new Point(this.pos, this.lines.add(lid));
        }
    }

    function newPoint (pos: [number, number]) : Point {
        return new Point(pos, im.Set<string>())
    }

    class Line {
        constructor(private pids: [string, string]) { }

        get p() : string { return this.pids[0] }
        get q() : string { return this.pids[1] }

        get pq() : { p: string; q: string; } {
            return { p: this.pids[0], q: this.pids[1] };
        }
    }

    function newLine(pids: [string, string]) : Line {
        return new Line(pids);
    }

    export interface ObjVec2 {
        x: number;
        y: number;
    }

    export interface SceneObject {
        points: {
            [pid: string] : ObjVec2
        };
        lines: {
            [lid: string] : { p: string; q: string; }
        };
    }

    export function newScene() : Scene {
        return new Scene(im.Map<string, Point>(), im.Map<string, Line>());
    }

    // export function makeSceneFromJS(scene: SceneObject) : Scene {

    // }

    function addLine(lid) {
        return p => p.addLine(lid);
    }

    class Scene {
        constructor(
            private points: im.Map<string, Point>,
            private lines: im.Map<string, Line>) { }

        public toJS() : SceneObject {
            return {
                points: this.points.map( point => point.xy ).toJS(),
                lines: this.lines.map( line => line.pq ).toJS()
            };
        }

        public addPoint(id: string, pos: [number, number]): Scene {
            return new Scene(this.points.set(id, newPoint(pos)), this.lines);
        }

        public addPoints(points: Array<[string, [number, number]]>) : Scene {
            return new Scene(
                this.points.withMutations(map => {
                    points.forEach(point => map.set(point[0], newPoint(point[1])))
                }),
                this.lines
            );
        }

        public addLine(id: string, pids: [string, string]): Scene {
            var points = this.points
                .update(pids[0], addLine(id))
                .update(pids[1], addLine(id))
            return new Scene(points, this.lines.set(id, newLine(pids)));
        }

        public addLines(lines: Array<[string, [string, string]]>) : Scene {
            return new Scene(
                this.points.withMutations(map => {
                    lines.forEach(line =>
                        map
                            .update(line[1][0], addLine(line[0]))
                            .update(line[1][1], addLine(line[0]))
                    )
                }),
                this.lines.withMutations(map => {
                    lines.forEach(line => map.set(line[0], newLine(line[1])))
                })
            );
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
