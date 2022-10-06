'use strict';

var server = require('server');
var page = module.superModule;
var shippedBasketHelpers = require('~/cartridge/scripts/helpers/shippedBasketHelpers');

server.extend(page);

server.prepend('Begin', function (req, res, next) {
  var BasketMgr = require('dw/order/BasketMgr');
  var currentBasket = BasketMgr.getCurrentBasket();

  shippedBasketHelpers.ensureCorrectShippedLineItems(
    currentBasket, req.session.privacyCache.get('shippedSuite')
  );

  next();
});

module.exports = server.exports();
