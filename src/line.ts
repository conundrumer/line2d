///<reference path='../node_modules/immutable/dist/Immutable.d.ts'/>
import Immutable = require('immutable');
import point = require('./point');

interface Point extends point.Point {}

type LineID = string;
export type PointID = string;
type TupleVec = [number, number];

interface Map<K,V> extends Immutable.Map<K,V> {}
interface Set<V> extends Immutable.Set<V> {}
interface PointMap extends Map<PointID, Point> {}
interface LineMap extends Map<LineID, Line> {}

interface ObjVec { x: number; y: number; }
export interface EndPoints { p: PointID; q: PointID; }

export class Line {
    constructor(private pids: [PointID, PointID]) { }

    get p() : PointID { return this.pids[0] }
    get q() : PointID { return this.pids[1] }

    get pq() : EndPoints { return { p: this.pids[0], q: this.pids[1] }; }
}

export function newLine(pids: [PointID, PointID]) : Line {
    return new Line(pids);
}
