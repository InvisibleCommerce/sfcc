'use strict';

function enqueueOrder(order) {
  var Transaction = require('dw/system/Transaction');
  var CustomObjectMgr = require('dw/object/CustomObjectMgr');
  var orderID = order.getOrderNo();

  Transaction.wrap(function () {
    var queueObj = CustomObjectMgr.createCustomObject('shippedOrderQueue', orderID);
    queueObj.custom.orderNo = orderID;
  });
}

module.exports = {
  enqueueOrder: enqueueOrder
};
