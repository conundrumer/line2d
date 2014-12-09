import Point = require('./point');
import Line = require('./line');
import Scene = require('./scene');

module Line2D {

    export type LineID = string;
    export type PointID = string;
    export type PointTuple = [number, number];

    export interface SceneObj {
        points: PointsObj;
        lines: LinesObj;
    }
    export interface PointsObj {
        [pid: string] : PointObjVec
    }
    export interface LinesObj {
        [lid: string] : LineEndPoints
    }
    export interface PointObjVec {
        x: number;
        y: number;
    }
    export interface LineEndPoints {
        p: PointID;
        q: PointID;
    }

    export function toPoints(pointProps: Array<[PointID, PointTuple]>) : PointsObj {
        var points: PointsObj = {};
        pointProps.forEach( p => {
            points[p[0]] = { x: p[1][0], y: p[1][1] };
        });
        return points;
    }

    export function toLines(lineProps: Array<[LineID, [PointID, PointID]]>) : LinesObj {
        var lines: LinesObj = {};
        lineProps.forEach( l => {
            lines[l[0]] = { p: l[1][0], q: l[1][1] };
        });
        return lines;
    }

    export interface Scene {
        toJS(): SceneObj;
        addPoint(id: PointID, pos: PointTuple): Scene;
        addPoints(points: PointsObj): Scene;
        addLine(lid: LineID, pids: [PointID, PointID]): Scene;
        addLines(lines: LinesObj): Scene;
        removePoint(pid: PointID): Scene;
        removePoints(pids: Array<PointID>): Scene;
        removeLine(lid: LineID): Scene;
        removeLines(lids: Array<LineID>): Scene;
    }
    export function newScene() : Scene {
        return Scene.create();
    }

    export function makeSceneFromJS(scene: SceneObj) : Scene {
        return Scene.create().addPoints(scene.points).addLines(scene.lines);
    }
}

export = Line2D;

declare var module;
declare var define;
// https://github.com/umdjs/umd
if (typeof module === "object" && module.exports) {
    // CommonJS (Node)
    module.exports = Line2D;
} else if (typeof define === "function" && define.amd) {
    // AMD
    define(function () { return Line2D; });
} else {
    window['Line2D'] = Line2D;
}
