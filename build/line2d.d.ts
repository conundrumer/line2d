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
            [pids: string]: PointObj;
        };
        lines: {
            [lids: string]: LineObj;
        };
    }
    function toPoints(pointProps: Array<[PointID, VecTuple]>): PointObj[];
    function toLines(lineProps: Array<[LineID, [PointID, PointID]]>): LineObj[];
    interface Scene {
        toJS(): SceneObj;
        getPoint(pid: PointID): PointObj;
        getPoints(pids: Array<PointID>): Array<PointObj>;
        getLine(lid: LineID): LineObj;
        getLines(lids: Array<LineID>): Array<LineObj>;
        getLinesFromPoint(pid: PointID): Array<LineID>;
        getLinesFromPoints(pids: Array<PointID>): Array<LineID>;
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
    function newScene(): Scene;
}
export = Line2D;
