'use strict';

var server = require('server');
var BasketMgr = require('dw/order/BasketMgr');
var page = module.superModule;
var shippedBasketHelpers = require('int_shipped/cartridge/scripts/helpers/shippedBasketHelpers');

server.extend(page);

server.prepend('Begin', function (req, res, next) {
  var currentBasket = BasketMgr.getCurrentBasket();

  shippedBasketHelpers.ensureCorrectShippedLineItems(currentBasket, req.session.privacyCache.get('shippedSuite'));

  next();
});

module.exports = server.exports();
