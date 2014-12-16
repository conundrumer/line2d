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
    .addPoint(P([['a', [0, 0]]])[0])
    .addPoints(P([
        ['b', [0, 1]],
        ['c', [1, 0]]
    ]))
    .addLine(L([['ab', ['a', 'b']]])[0])
    .addLines(L([
        ['bc', ['b', 'c']],
        ['ca', ['c', 'a']]
    ]))

console.log('stringify', JSON.stringify(s1));
console.log('toJS', s1.toJS());
console.log('removeLine',JSON.stringify(s1.removeLine('ab')));
console.log('removeLines',JSON.stringify(s1.removeLines(['ab','bc'])));
console.log('removePoint',JSON.stringify(s1.removePoint('a')));
console.log('removePoints',JSON.stringify(s1.removePoints(['a','b'])));

console.log('getPoint', s1.getPoint('a'))
console.log('getPoints', s1.getPoints(['b','c']))
console.log('getLine', s1.getLine('ab'))
console.log('getLines', s1.getLines(['bc','ca']))
console.log('getLinesFromPoint', s1.getLinesFromPoint('a'))
console.log('getLinesFromPoints', s1.getLinesFromPoints(['b','c']))

console.log('eraseLine', s1.eraseLine('ab').toJS())
console.log('eraseLine', s1.eraseLine('ab').eraseLine('bc').toJS())
console.log('eraseLines', s1.eraseLines(['bc','ca']).toJS())
console.log('eraseLines', s1.eraseLines(['bc','ca','ab']).toJS())
