import im = require('immutable');
import Point = require('./point');
declare class Line {
    private pids;
    constructor(pids: [Point.ID, Point.ID]);
    toJSON(id: Line.ID): {
        id: string;
        pq: Line.EndPoints;
    };
    p: Point.ID;
    q: Point.ID;
    pq: Line.EndPoints;
}
declare module Line {
    type ID = string;
    interface EndPoints {
        p: Point.ID;
        q: Point.ID;
    }
    interface Map extends im.Map<ID, Line> {
    }
    var Map: (a?: im.KeyedIterable<string, Line> | im.Iterable<any, [string, Line]> | [string, Line][] | {
        [key: string]: Line;
    } | im.Iterator<[string, Line]>) => Map;
    function create(pq: EndPoints): Line;
}
export = Line;
