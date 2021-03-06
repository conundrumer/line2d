var Line2D;
if (require) {
    Line2D = require('./dist/line2d')
} else {
    Line2D = window.Line2D
}
var P = Line2D.toPoint;
var L = Line2D.toLine;

var emptyScene = Line2D.newScene();

var s1 = emptyScene
    .points.add(P(['a', [0, 0]]))
    .points.add([
        ['b', [0, 1]],
        ['c', [1, 0]]
    ].map(P))
    .lines.add(L(['ab', ['a', 'b']]))
    .lines.add([
        ['bc', ['b', 'c']],
        ['ca', ['c', 'a']]
    ].map(L))

console.log('stringify', JSON.stringify(s1));
console.log('toJSON', s1.toJSON());
console.log('removeLine',JSON.stringify(s1.lines.remove('ab')));
console.log('removeLines',JSON.stringify(s1.lines.remove(['ab','bc'])));
console.log('removePoint',JSON.stringify(s1.points.remove('a')));
console.log('removePoints',JSON.stringify(s1.points.remove(['a','b'])));

console.log('getPoint', s1.points.get('a'))
console.log('getPoints', s1.points.get(['b','c']))
console.log('getLine', s1.lines.get('ab'))
console.log('getLines', s1.lines.get(['bc','ca']))
console.log('getLinesFromPoint', s1.lines.selectFromPoints('a'))
console.log('getLinesFromPoints', s1.lines.selectFromPoints(['b','c']))

console.log('eraseLine', s1.lines.erase('ab').toJSON())
console.log('eraseLine', s1.lines.erase('ab').lines.erase('bc').toJSON())
console.log('eraseLines', s1.lines.erase(['bc','ca']).toJSON())
console.log('eraseLines', s1.lines.erase(['bc','ca','ab']).toJSON())

console.log('getPointsInRadius', s1.points.selectInRadius({x: 0.1, y: 0}, 1))
console.log('getLinesInRadius', s1.lines.selectInRadius({x: 0.5, y: 0.48}, 0.49))
console.log('getLinesInRadius', s1.lines.selectInRadius({x: -0.1, y: -0.1}, 0.2))
