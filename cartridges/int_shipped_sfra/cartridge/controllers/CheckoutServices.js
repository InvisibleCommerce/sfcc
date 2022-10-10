'use strict';

var server = require('server');
var OrderMgr = require('dw/order/OrderMgr');
var shippedHelpers = require('int_shipped/cartridge/scripts/helpers/shippedHelpers');
var Site = require('dw/system/Site').getCurrent();

var page = module.superModule;
server.extend(page);

server.append('PlaceOrder', server.middleware.https, function (req, res, next) {
  if (!Site.getCustomPreferenceValue('shippedOrderSync')) {
    return next();
  }

  var viewData = res.getViewData();

  if (viewData.error) {
    return next();
  }

  shippedHelpers.enqueueOrder(OrderMgr.getOrder(viewData.orderID));

  return next();
});

module.exports = server.exports();
