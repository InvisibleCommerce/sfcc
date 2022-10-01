'use strict';

var server = require('server');

var page = module.superModule;
server.extend(page);

server.append('PlaceOrder', server.middleware.https, function (req, res, next) {
  var Site = require('dw/system/Site').getCurrent();
  var OrderMgr = require('dw/order/OrderMgr');
  var orders = require('~/cartridge/scripts/shipped/orders');

  var viewData = res.getViewData();

  if (viewData.error) {
    return next();
  }

  var order = OrderMgr.getOrder(viewData.orderID);
  var orderToken = order.getOrderToken();

  // Resolves an order using the orderNumber and orderToken.
  order = OrderMgr.getOrder(viewData.orderID, orderToken);

  var ordersResponse = orders.syncOrder(order);

  return next();
});

module.exports = server.exports();
