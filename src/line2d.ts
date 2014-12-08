///<reference path='../node_modules/immutable/dist/Immutable.d.ts'/>
import im = require('immutable');

module Line2D {
    class Point {
        public x: number;
        public y: number;
        constructor(pos: [number, number]) {
            this.x = pos[0];
            this.y = pos[1];
        }
    }

    class Line {
        public p: string;
        public q: string;
        constructor(pids: [string, string]) {
            this.p = pids[0];
            this.q = pids[1];
        }
    }

    export interface SceneObject {
        points: {
            [pid: string] : { x: number; y: number; }
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
                points: this.points.map( point => {
                    return { x: point.x, y: point.y };
                }).toJS(),
                lines: this.lines.map( line => {
                    return { p: line.p, q: line.q };
                }).toJS()
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
