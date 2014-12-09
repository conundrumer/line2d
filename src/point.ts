///<reference path='../node_modules/immutable/dist/Immutable.d.ts'/>
import Immutable = require('immutable');
import line = require('./line')

interface Line extends line.Line {}

var Map = Immutable.Map;
var Set = Immutable.Set;

export type LineID = string;
type PointID = string;
export type TupleVec = [number, number];

interface Map<K,V> extends Immutable.Map<K,V> {}
export interface Set<V> extends Immutable.Set<V> {}
interface PointMap extends Map<PointID, Point> {}
interface LineMap extends Map<LineID, Line> {}

export interface ObjVec { x: number; y: number; }
interface EndPoints { p: PointID; q: PointID; }

export class Point {
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

export function newPoint (pos: TupleVec) : Point {
    return new Point(pos, Set<LineID>())
}
