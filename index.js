var Line2D;
if (require) {
    Line2D = require('./dist/line2d')
} else {
    Line2D = window.Line2D
}
var P = Line2D.toPoints;
var L = Line2D.toLines;

var emptyScene = Line2D.newScene();

var s1 = emptyScene
    .addPoint('0_0', [0, 0])
    .addPoints(P([
        ['0_1', [0, 1]],
        ['0_2', [1, 0]]
    ]))
    .addLine('0_0', ['0_0', '0_1'])
    .addLines(L([
        ['0_1', ['0_1', '0_2']],
        ['0_2', ['0_2', '0_0']]
    ]))

console.log(JSON.stringify(s1));
console.log(s1.toJS());
