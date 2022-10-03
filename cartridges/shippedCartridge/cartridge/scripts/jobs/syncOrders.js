'use strict';

var OrderMgr = require('dw/order/OrderMgr');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Status = require('dw/system/Status');
var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');
var orders = require('~/cartridge/scripts/shipped/orders');

exports.execute = function () {
  logger.info('Starting orders sync...');

  var ordersQueue = CustomObjectMgr.getAllCustomObjects('shippedOrderQueue');

  while (ordersQueue.hasNext()) {
    var queueOrder = ordersQueue.next();
    var orderNo = queueOrder.custom.orderNo;

    var order = OrderMgr.getOrder(orderNo);
    orders.syncOrder(order);
  }

  logger.info('Orders sync completed');

  return new Status(Status.OK, 'OK', 'Orders Sync job completed');
};
