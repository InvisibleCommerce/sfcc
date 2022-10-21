'use strict';

var Resource = require('dw/web/Resource');

var shipped_shield_id = 'shipped-shield';
var shipped_green_id = 'shipped-green';
var shipped_descriptions = {};
shipped_descriptions[shipped_shield_id] = Resource.msg('label.shipped.shield', 'shipped', 'Shipped Shield');
shipped_descriptions[shipped_green_id] = Resource.msg('label.shipped.green', 'shipped', 'Shipped Green');

exports.SHIPPED_IDS = [shipped_shield_id, shipped_green_id];
exports.SHIPPED_SHIELD_ID = shipped_shield_id;
exports.SHIPPED_GREEN_ID = shipped_green_id;
exports.SHIPPED_NAMES = shipped_descriptions;
