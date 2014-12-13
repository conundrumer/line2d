import Point = require('./point');
import Line = require('./line');
import Scene = require('./scene');

module Line2D {

    export type LineID = string;
    export type PointID = string;
    export type VecTuple = [number, number];
    export type LengthRange = [number, number];
    export interface LengthFn {
        (prevLength: number, time: number): number
    }
    export interface VecObj {
        x: number;
        y: number;
    }

    export interface PointObj {
        id: PointID;
        pos: VecObj;
        prevPos?: VecObj;
        solid?: boolean;
        props?: {
            mass?: number;
            airFriction?: number;
            friction?: number;
            restitution?: number;
        };
    }
    export interface LineObj {
        id: LineID;
        pq: {
            p: PointID;
            q: PointID;
        };
        length?: number | LengthRange | LengthFn;
        solid?: boolean;
        singleSided?: boolean;
        props?: {
            airFriction?: number;
            friction?: number;
            restitution?: number;
            acceleration?: number;
            breakThreshold?: number;
        }
    }

    export function toPoints(pointProps: Array<[PointID, VecTuple]>) : PointsObj {
        return pointProps.forEach( p => {
            return {
                id: p[0],
                pos: {
                    x: p[1][0],
                    y: p[1][1]
                }
            }
        })
    }

    export function toLines(lineProps: Array<[LineID, [PointID, PointID]]>) : LinesObj {
        return pointProps.forEach( p => {
            return {
                id: l[0],
                pq: {
                    p: l[1][0],
                    q: l[1][1]
                }
            }
        })
    }

    export interface Scene {
        toJS(): SceneObj;

        getPoint(pid: PointID): VecObj;
        getPoints(pids: Array<PointID>): PointsObj;
        getLine(lid: LineID): LinePointIDs;
        getLines(lids: Array<LineID>): LinesObj;

        getLinesFromPoint(pid: PointID): Array<LineID>;
        getLinesFromPoints(pids: Array<PointID>): { [pid: string]: Array<LineID>};
        getLinesSetFromPoints(pids: Array<PointID>): Array<LineID>;

        addPoint(point: PointObj): Scene;
        addPoints(points: Array<PointObj>): Scene;
        addLine(line: LineObj): Scene;
        addLines(lines: Array<LineObj>): Scene;

        removePoint(pid: PointID): Scene;
        removePoints(pids: Array<PointID>): Scene;
        removeLine(lid: LineID): Scene;
        removeLines(lids: Array<LineID>): Scene;

        eraseLine(lid: LineID): Scene;
        eraseLines(lids: Array<LineID>): Scene;
    }
    export function newScene() : Scene {
        return Scene.create();
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
