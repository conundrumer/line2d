///<reference path='../../node_modules/immutable/dist/Immutable.d.ts'/>
import im = require('immutable');

interface Map<K, V> extends im.Map<K, V> {}

var Map: typeof im.Map = im.Map;

export = Map;
