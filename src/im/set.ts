///<reference path='../../node_modules/immutable/dist/Immutable.d.ts'/>
import im = require('immutable');

interface Set<T> extends im.Set<T> {}

var Set: typeof im.Set = im.Set;

export = Set;
