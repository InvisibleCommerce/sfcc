'use strict';

var server = require('server');
var page = module.superModule;
var ProductMgr = require('dw/catalog/ProductMgr');
var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
var shippedBasketHelpers = require('~/cartridge/scripts/helpers/shippedBasketHelpers');

server.extend(page);

// server.replace('Begin', function (req, res, next) {
//   res.json({ status: 'added', session: req.session.privacyCache.get('shippedSuite') });
//   next();
// });

server.prepend('Begin', function (req, res, next) {
  var BasketMgr = require('dw/order/BasketMgr');
  var currentBasket = BasketMgr.getCurrentBasket();

  shippedBasketHelpers.ensureCorrectShippedLineItems(
    currentBasket, req.session.privacyCache.get('shippedSuite')
  );

  next();
});


module.exports = server.exports();
