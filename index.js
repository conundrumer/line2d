var Line2D;
if (require) {
    Line2D = require('./dist/line2d')
} else {
    Line2D = window.Line2D
}

var emptyScene = Line2D.newScene();

// var p1 = new Line2D.Point('0', [0, 0]);
// var p2 = new Line2D.Point('1', [1, 1]);

// var l = new Line2D.Line('0', p1, p2);

var s1 = emptyScene
    .addPoint('0_0', [0, 0])
    .addPoints([
        ['0_1', [0, 1]],
        ['0_2', [1, 0]]
    ])
    .addLine('0_0', ['0_0', '0_1'])
    .addLines([
        ['0_1', ['0_1', '0_2']],
        ['0_2', ['0_2', '0_0']]
    ])

// console.log(JSON.stringify(s1));
console.log(s1.toJS());
