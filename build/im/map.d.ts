/// <reference path="../../node_modules/immutable/dist/Immutable.d.ts" />
import im = require('immutable');
interface Map<K, V> extends im.Map<K, V> {
}
declare var Map: typeof im.Map;
export = Map;
