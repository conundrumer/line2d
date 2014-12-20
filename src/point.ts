import im = require('immutable');
import Set = require('./im/set');
import Line = require('./line')
import Vec = require('./vec');

class Point {
    constructor(private pos: Vec.Tuple, private lineSet: Set<Line.ID>) { }

    toJSON(id: Point.ID) {
        return {
            id: id,
            pos: this.xy
        }
    }

    get x() : number {
        return this.pos[0]
    }
    get y() : number {
        return this.pos[1]
    }

    get xy() : Vec.Obj {
        return {
            x: this.pos[0],
            y: this.pos[1]
        };
    }

    get lines() : Set<Line.ID> {
        return this.lineSet;
    }

    addLine(lid: Line.ID) : Point {
        return new Point(this.pos, this.lineSet.add(lid));
    }

    addLines(lids: Set<Line.ID>) : Point {
        return new Point(this.pos, this.lineSet.union(lids));
    }

    removeLine(lid: Line.ID) : Point {
        return new Point(this.pos, this.lineSet.remove(lid));
    }

    removeLines(lids: Set<Line.ID>) : Point {
        return new Point(this.pos, this.lineSet.subtract(lids));
    }
}

module Point {
    export type ID = string;
    export interface Map extends im.Map<ID, Point> {}
    export var Map = (a?:
        (im.KeyedIterable<ID, Point>)
        | (im.Iterable<any, [ID, Point]>)
        | (Array<[ID, Point]>)
        | ({[key: string]: Point})
        | (im.Iterator<[ID, Point]>)
        // | (/*im.Iterable<[ID, Point]>*/Object)
        ): Point.Map => im.Map<ID, Point>(a);

    export function create (pos: Vec.Obj) : Point {
        return new Point([pos.x, pos.y], Set<Line.ID>())
    }
}

export = Point;
