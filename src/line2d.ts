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
    export interface SceneObj {
        points: {
            [pids: string]: PointObj;
        };
        lines: {
            [lids: string]: LineObj;
        };
    }

    export function toPoints(pointProps: Array<[PointID, VecTuple]>) : PointObj[] {
        return pointProps.map( p => { return { // can't use {{}} for some reason
            id: p[0],
            pos: {
                x: p[1][0],
                y: p[1][1]
            }
        }} );
    }

    export function toLines(lineProps: Array<[LineID, [PointID, PointID]]>) : LineObj[] {
        return lineProps.map( l => { return {
            id: l[0],
            pq: {
                p: l[1][0],
                q: l[1][1]
            }
        }} );
    }

    export interface Entities<ID, Obj> {
        get(id: ID | Array<ID>): Array<Obj>;
        add(entity: Obj | Array<Obj>): Scene;
        remove(id: ID | Array<ID>): Scene;
        getInRadius(pos: VecObj, radius: number): Array<ID>;
    }

    export interface Points extends Entities<PointID, PointObj> {}

    export interface Lines extends Entities<LineID, LineObj> {
        getFromPoints(id: PointID | Array<PointID>): Array<LineID>;
        // like remove except also removes points not attached to any lines
        erase(id: LineID | Array<LineID>): Scene;
    }

    export interface Scene {
        toJS(): SceneObj;

        points: Points;
        lines: Lines;
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
