/* eslint-disable no-continue */
/* eslint-disable linebreak-style */
/* global module */

var OrderMgr = require('dw/order/OrderMgr');
var Status = require('dw/system/Status');
var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');
var orders = require('~/cartridge/scripts/shipped/orders');

exports.execute = function () {
  logger.info('Starting orders sync...');

  var order = OrderMgr.getOrder('00000201');
  orders.syncOrder(order);

  logger.info('Orders sync completed');

  return new Status(Status.OK, 'OK', 'Orders Sync job completed');
};
