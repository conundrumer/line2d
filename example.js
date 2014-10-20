/* initialization */

// make a new scene
var emptyScene = new Line2D.Scene();

// make some entities with initial positions
var id = 0; // atm you need to specify and keep track of ids, sorry :(
// box
var p1 = new Line2D.Point(id++, [0, 0]);
var p2 = new Line2D.Point(id++, [0, 1]);
var p3 = new Line2D.Point(id++, [1, 1]);
var p4 = new Line2D.Point(id++, [1, 0]);
var l1 = new Line2D.Line(id++, p1, p2);
var l2 = new Line2D.Line(id++, p2, p3);
var l3 = new Line2D.Line(id++, p3, p4);
var l4 = new Line2D.Line(id++, p4, p1);
var l5 = new Line2D.Line(id++, p1, p3);
var l6 = new Line2D.Line(id++, p2, p4);

// triangle
var q1 = new Line2D.Point(id++, [2, 2]);
var q2 = new Line2D.Point(id++, [2, 3]);
var q3 = new Line2D.Point(id++, [3, 2]);
var m1 = new Line2D.Line(id++, q1, q2);
var m2 = new Line2D.Line(id++, q2, q3);
var m3 = new Line2D.Line(id++, q3, q1);

/* selection and modification */

// add/remove/select/update are immutable operations
// so you can have an undo/redo stack or maybe even version control

// add points first to make sure lines have points to be connected to
sceneWithBox = emptyScene
  .add([p1, p2, p3, p4])
  .add([l1, l2, l3, l4, l5, l6]);

sceneWithBoxAndTriangle = sceneWithBox
  .add([q1, q2])
  .add([m1, m2, m3]);

// remove just a line
sceneWithBoxAndBrokenTriangle = sceneWithBoxAndTriangle
  .remove(m1);

// remove a point and the lines connected to it
sceneWithBoxAndLineSegment = sceneWithBoxAndBrokenTriangle
  .remove(q2);

// move a point, but that stretches the constraint
sceneWithBoxAndStretchedLine = sceneWithBoxAndLineSegment
  .select(q3).update.points(function (p) {
    return { y: p.pos.y + 1 };
  });

// update the line to take on the new length
sceneWithBoxAndLongLine = sceneWithBoxAndStretchedLine
  .select(m2).update.lines(function (l) {
    return { restLength: l.length };
  });

// you can also select based on closest in a radius or bounding box
// lines partially in box get selected too
sceneWithBox.select.closest([0,0], 1);
var selectedBox = sceneWithBox.select.box([-0.5, -0.5], [0.5, 0.5]);

// chain selects and unselects I guess, to enable a full fledged editor
selectedBox.unselect.box([-0.1, -0.1], [0.1, 0.1]).select(p3).select(l2);

// select incident and connected because graphs
var updatedScene = sceneWithBoxAndTriangle
  .select.incident(q1) // selects q1, m1, and m2
  .select.connected(p1) // selects the entire box
  .update(function updatePoints (p) {
    return {};
  }, function updateLines (l) {
    return {};
  });

/* simulation */

// step is also immutable. these scenes are all unique
scene1 = sceneWithBoxAndTriangle.step();
scene2 = scene1.step();
scene5 = scene2.step().step().step();

// you can update these scenes too
scene2alt = scene1.update(function(physics) {
  return { airFriction: physics.airFriction / 2 };
}).step();

/* rendering */

// use tap for side-effecting functions on selections
// if you mutate stuff you will have a bad time
// you may wany to render different selections differently
var triangle = sceneWithBoxAndTriangle.select.connected(p1);
sceneWithBoxAndTriangle.select.all().tap(function renderPoints(p) {
  if (triangle.has(p)) {
    /* render selected */
  } else {
    /* render normal */
  }
}, function renderLines(l) {
  if (triangle.has(l)) {
    /* render selected */
  } else {
    /* render normal */
  }
});
// actually it would be better to select a bounding box of the window

/* Creating entities with custom attributes */
// TODO

/* Extending impulses and constraints */
// TODO
