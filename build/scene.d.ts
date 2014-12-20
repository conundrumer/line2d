import Line2D = require('./line2d');
import Point = require('./point');
import Line = require('./line');
declare class Scene implements Line2D.Scene {
    private _points;
    private _lines;
    private pointMethods;
    private lineMethods;
    constructor(_points: Point.Map, _lines: Line.Map);
    points: Line2D.Points;
    lines: Line2D.Lines;
    toJSON(): Line2D.SceneObj;
    private getPoint(pid);
    private getPoints(pids);
    private getLine(lid);
    private getLines(lids);
    private selectLinesFromPoint(pid);
    private selectLinesFromPoints(pids);
    private addPoint(point);
    addPoints(points: Array<Line2D.PointObj>): Scene;
    private addLine(line);
    private addLines(lines);
    private removeLine(lid);
    private removeLines(lids);
    private removePoint(pid);
    private removePoints(pids);
    private eraseLine(lid);
    private eraseLines(lids);
    private selectPointsInRadius(pos, r);
    private selectLinesInRadius(pos, r);
}
declare module Scene {
    function create(): Scene;
}
export = Scene;
