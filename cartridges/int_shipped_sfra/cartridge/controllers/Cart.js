'use strict';

var server = require('server');
var BasketMgr = require('dw/order/BasketMgr');
var page = module.superModule;
var shippedBasketHelpers = require('int_shipped/cartridge/scripts/helpers/shippedBasketHelpers');
var Site = require('dw/system/Site').getCurrent();

server.extend(page);

server.prepend('Show', function (req, res, next) {
  if (Site.getCustomPreferenceValue('shippedWidgetLocation').value === 'checkout') {
    var currentBasket = BasketMgr.getCurrentBasket();
    shippedBasketHelpers.removeShippedOrderPriceAdjustments(currentBasket);
  }

  next();
});

module.exports = server.exports();
