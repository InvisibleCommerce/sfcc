'use strict';

var server = require('server');
var page = module.superModule;

server.extend(page);

server.prepend('Begin', server.middleware.get, function (req, res, next) {
  // let session = req.session;
  // res.json({ status: 'added', session: session });

  var BasketMgr = require('dw/order/BasketMgr');
  var Transaction = require('dw/system/Transaction');
  var currentBasket = BasketMgr.getCurrentBasket();
  var totalPrice = currentBasket.merchandizeTotalGrossPrice.value;
  var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
  var shippedLi;

  Transaction.wrap(function () {
    shippedLi = cartHelper.addProductToCart(currentBasket, 'shipped-shield', 1, [], []);
  });

  Transaction.wrap(function () {
    shippedLi.setPriceValue(0.97);
    shippedLi.setQuantityValue(1);
  });

  // if (true) { // should add or remove shipped?
  //   res.json({ status: 'added', totalPrice: totalPrice });
  // }
  next();
});

module.exports = server.exports();
