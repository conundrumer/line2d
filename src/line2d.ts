///<reference path='../node_modules/immutable/dist/Immutable.d.ts'/>
import im = require('immutable');

module Line2D {
    class Point {
        constructor(private pos: [number, number]) { }

        get x() : number { return this.pos[0] }
        get y() : number { return this.pos[1] }

        get xy() : ObjVec2 { return { x: this.pos[0], y: this.pos[1] } }

        // public addLine:
    }

    class Line {
        constructor(private pids: [string, string]) { }

        get p() : string { return this.pids[0] }
        get q() : string { return this.pids[1] }

        get pq() : { p: string; q: string; } {
            return { p: this.pids[0], q: this.pids[1] };
        }
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
            return new Scene(this.points.set(id, new Point(pos)), this.lines);
        }

        public addLine(id: string, pids: [string, string]): Scene {
            return new Scene(this.points, this.lines.set(id, new Line(pids)));
        }

        public addPoints(points: Array<[string, [number, number]]>) : Scene {
            return new Scene(
                this.points.withMutations(map => {
                    points.forEach(point => map.set(point[0], new Point(point[1])))
                }),
                this.lines
            );
        }

        public addLines(lines: Array<[string, [string, string]]>) : Scene {
            return new Scene(
                this.points,
                this.lines.withMutations(map => {
                    lines.forEach(line => map.set(line[0], new Line(line[1])))
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
