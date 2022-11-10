'use strict';

var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');

/**
 * Creates a shippedOrderQueue object for an order
 * @param {dw.order.Order} order - Current user's basket
 */

function enqueueOrder(order) {
  var orderID = order.getOrderNo();

  Transaction.wrap(function () {
    var queueObj = CustomObjectMgr.createCustomObject('shippedOrderQueue', orderID);
    queueObj.custom.orderNo = orderID;
  });
}

module.exports = {
  enqueueOrder: enqueueOrder
};
