import Line2D = require('./line2d');
import Point = require('./point');
import Line = require('./line');
declare class Scene implements Line2D.Scene {
    private points;
    private lines;
    constructor(points: Point.Map, lines: Line.Map);
    toJS(): Line2D.SceneObj;
    getPoint(pid: Point.ID): Line2D.PointObj;
    getPoints(pids: Array<Point.ID>): Array<Line2D.PointObj>;
    getLine(lid: Line.ID): Line2D.LineObj;
    getLines(lids: Array<Line.ID>): Array<Line2D.LineObj>;
    getLinesFromPoint(pid: Point.ID): Array<Line.ID>;
    getLinesFromPoints(pids: Array<Point.ID>): Array<Line.ID>;
    addPoint(point: Line2D.PointObj): Scene;
    addPoints(points: Array<Line2D.PointObj>): Scene;
    addLine(line: Line2D.LineObj): Scene;
    addLines(lines: Array<Line2D.LineObj>): Scene;
    removeLine(lid: Line.ID): Scene;
    removeLines(lids: Array<Line.ID>): Scene;
    removePoint(pid: Point.ID): Scene;
    removePoints(pids: Array<Point.ID>): Scene;
    eraseLine(lid: Line.ID): Scene;
    eraseLines(lids: Array<Line.ID>): Scene;
}
declare module Scene {
    function create(): Scene;
}
export = Scene;
