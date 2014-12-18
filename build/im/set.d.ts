/// <reference path="../../node_modules/immutable/dist/Immutable.d.ts" />
import im = require('immutable');
interface Set<T> extends im.Set<T> {
}
declare var Set: typeof im.Set;
export = Set;
