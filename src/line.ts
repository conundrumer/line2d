import im = require('immutable');
import Point = require('./point');

class Line {
    constructor(private pids: [Point.ID, Point.ID]) { }

    get p() : Point.ID {
        return this.pids[0]
    }
    get q() : Point.ID {
        return this.pids[1]
    }

    get pq() : Line.EndPoints {
        return {
            p: this.pids[0],
            q: this.pids[1]
        };
    }
}

module Line {
    export type ID = string;
    export interface EndPoints {
        p: Point.ID;
        q: Point.ID;
    }

    export interface Map extends im.Map<ID, Line> {}
    export var Map = (a?:
        (im.KeyedIterable<ID, Line>)
        | (im.Iterable<any, [ID, Line]>)
        | (Array<[ID, Line]>)
        | ({[key: string]: Line})
        | (im.Iterator<[ID, Line]>)
        // | (/*im.Iterable<[ID, Line]>*/Object)
        ): Line.Map => im.Map<ID, Line>(a);

    export function create(pids: [Point.ID, Point.ID]) : Line {
        return new Line(pids);
    }
}

export = Line;
