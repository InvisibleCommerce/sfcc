'use strict';

var Transaction = require('dw/system/Transaction');
var CustomObjectMgr = require('dw/object/CustomObjectMgr');

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
