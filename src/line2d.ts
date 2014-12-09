import Immutable = require('immutable');
import point = require('./point');
import line = require('./line');

interface Line extends line.Line {}
interface Point extends point.Point {}

var Map = Immutable.Map;
var Set = Immutable.Set;

var Point = point.Point;
var Line = line.Line;

var newPoint = point.newPoint;
var newLine = line.newLine;

import scene = require('./scene');
var Scene = scene.Scene;

export module Line2D {

    export type LineID = string;
    export type PointID = string;
    export type TupleVec = [number, number];

    interface Map<K,V> extends Immutable.Map<K,V> {}
    interface Set<V> extends Immutable.Set<V> {}
    // interface PointMap extends Map<PointID, Point> {}
    // interface LineMap extends Map<LineID, Line> {}

    export interface ObjVec { x: number; y: number; }
    export interface EndPoints { p: PointID; q: PointID; }

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

    export interface Scene {
        toJS(): SceneObj;
        addPoint(id: PointID, pos: TupleVec): Scene;
        addPoints(points: PointsObj): Scene;
        addLine(lid: LineID, pids: [PointID, PointID]): Scene;
        addLines(lines: LinesObj): Scene;
        removeLine(lid: LineID): Scene;
        removeLines(lids: LineID[]): Scene;
        removePoint(pid: PointID): Scene;
        removePoints(pids: PointID[]): Scene;
    }
    export function newScene() : Scene {
        return new Scene(Map<PointID, Point>(), Map<LineID, Line>());
    }

    export function makeSceneFromJS(scene: SceneObj) : Scene {
        return newScene().addPoints(scene.points).addLines(scene.lines);
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
