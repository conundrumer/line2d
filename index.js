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
    .points.add(P([['a', [0, 0]]])[0])
    .points.add(P([
        ['b', [0, 1]],
        ['c', [1, 0]]
    ]))
    .lines.add(L([['ab', ['a', 'b']]])[0])
    .lines.add(L([
        ['bc', ['b', 'c']],
        ['ca', ['c', 'a']]
    ]))

console.log('stringify', JSON.stringify(s1));
console.log('toJS', s1.toJS());
console.log('removeLine',JSON.stringify(s1.lines.remove('ab')));
console.log('removeLines',JSON.stringify(s1.lines.remove(['ab','bc'])));
console.log('removePoint',JSON.stringify(s1.points.remove('a')));
console.log('removePoints',JSON.stringify(s1.points.remove(['a','b'])));

console.log('getPoint', s1.points.get('a'))
console.log('getPoints', s1.points.get(['b','c']))
console.log('getLine', s1.lines.get('ab'))
console.log('getLines', s1.lines.get(['bc','ca']))
console.log('getLinesFromPoint', s1.lines.getFromPoints('a'))
console.log('getLinesFromPoints', s1.lines.getFromPoints(['b','c']))

console.log('eraseLine', s1.lines.erase('ab').toJS())
console.log('eraseLine', s1.lines.erase('ab').lines.erase('bc').toJS())
console.log('eraseLines', s1.lines.erase(['bc','ca']).toJS())
console.log('eraseLines', s1.lines.erase(['bc','ca','ab']).toJS())

console.log('getPointsInRadius', s1.points.getInRadius({x: 0.1, y: 0}, 1))
