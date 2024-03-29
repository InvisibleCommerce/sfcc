'use strict';

var OrderMgr = require('dw/order/OrderMgr');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');
var Transaction = require('dw/system/Transaction');
var Status = require('dw/system/Status');
var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');
var orders = require('*/cartridge/scripts/shipped/orders');

/**
 * @function execute
 * @returns {dw.system.Status} - status
 */

exports.execute = function () {
  logger.info('Starting orders sync...');

  var ordersQueue;

  try {
    ordersQueue = CustomObjectMgr.getAllCustomObjects('shippedOrderQueue');

    while (ordersQueue.hasNext()) {
      var queueOrder = ordersQueue.next();
      var orderNo = queueOrder.custom.orderNo;

      var order = OrderMgr.getOrder(orderNo);
      var response = orders.syncOrder(order);

      if (!response.error) {
        Transaction.wrap(function () {
          CustomObjectMgr.remove(queueOrder);
        });
      }
    }
  } finally {
    if (ordersQueue) {
      ordersQueue.close();
    }
  }

  logger.info('Orders sync completed');

  return new Status(Status.OK, 'OK', 'Orders Sync job completed');
};
