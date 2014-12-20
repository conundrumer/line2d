declare module Line2D {
    type LineID = string;
    type PointID = string;
    type VecTuple = [number, number];
    type LengthRange = [number, number];
    interface LengthFn {
        (prevLength: number, time: number): number;
    }
    interface VecObj {
        x: number;
        y: number;
    }
    interface PointObj {
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
    interface LineObj {
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
        };
    }
    interface SceneObj {
        points: {
            [pid: string]: PointObj;
        };
        lines: {
            [lid: string]: LineObj;
        };
    }
    function toPoint(p: [PointID, VecTuple]): PointObj;
    function toLine(l: [LineID, [PointID, PointID]]): LineObj;
    interface Entities<ID, Obj> {
        get(id: ID | Array<ID>): {
            [id: string]: Obj;
        };
        add(entity: Obj | Array<Obj>): Scene;
        remove(id: ID | Array<ID>): Scene;
        selectInRadius(pos: VecObj, radius: number): Array<ID>;
    }
    interface Points extends Entities<PointID, PointObj> {
    }
    interface Lines extends Entities<LineID, LineObj> {
        selectFromPoints(id: PointID | Array<PointID>): Array<LineID>;
        erase(id: LineID | Array<LineID>): Scene;
    }
    interface Scene {
        toJSON(): SceneObj;
        points: Points;
        lines: Lines;
    }
    function newScene(): Scene;
    function makeSceneFromJSON(s: SceneObj): Scene;
}
export = Line2D;
