'use strict';

var server = require('server');
var BasketMgr = require('dw/order/BasketMgr');
var page = module.superModule;
var shippedBasketHelpers = require('~/cartridge/scripts/helpers/shippedBasketHelpers');

server.extend(page);

server.prepend('Show', function (req, res, next) {
  var currentBasket = BasketMgr.getCurrentBasket();

  shippedBasketHelpers.removeShippedOrderPriceAdjustments(currentBasket);

  next();
});

module.exports = server.exports();
