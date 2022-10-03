'use strict';

var server = require('server');
var shippedHelpers = require('~/cartridge/scripts/helpers/shippedHelpers');

var page = module.superModule;
server.extend(page);

server.append('PlaceOrder', server.middleware.https, function (req, res, next) {
  var OrderMgr = require('dw/order/OrderMgr');

  var viewData = res.getViewData();

  if (viewData.error) {
    return next();
  }

  var order = OrderMgr.getOrder(viewData.orderID);
  shippedHelpers.enqueueOrder(order);

  return next();
});

module.exports = server.exports();
