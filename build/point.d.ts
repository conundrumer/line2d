import im = require('immutable');
import Set = require('./im/set');
import Line = require('./line');
import Vec = require('./vec');
declare class Point {
    private pos;
    private lineSet;
    constructor(pos: Vec.Tuple, lineSet: Set<Line.ID>);
    toJSON(id: Point.ID): {
        id: string;
        pos: Vec.Obj;
    };
    x: number;
    y: number;
    xy: Vec.Obj;
    lines: Set<Line.ID>;
    addLine(lid: Line.ID): Point;
    addLines(lids: Set<Line.ID>): Point;
    removeLine(lid: Line.ID): Point;
    removeLines(lids: Set<Line.ID>): Point;
}
declare module Point {
    type ID = string;
    interface Map extends im.Map<ID, Point> {
    }
    var Map: (a?: im.KeyedIterable<string, Point> | im.Iterable<any, [string, Point]> | [string, Point][] | {
        [key: string]: Point;
    } | im.Iterator<[string, Point]>) => Map;
    function create(pos: Vec.Obj): Point;
}
export = Point;
