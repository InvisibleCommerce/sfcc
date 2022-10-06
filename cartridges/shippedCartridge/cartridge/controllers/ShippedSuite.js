const server = require('server');
var shippedBasketHelpers = require('~/cartridge/scripts/helpers/shippedBasketHelpers');
var BasketMgr = require('dw/order/BasketMgr');
var CartModel = require('*/cartridge/models/cart');

server.post('Add', function (req, res, next) {
  // let's add a variable to session indicating user opted in
  req.session.privacyCache.set('shippedSuite', true);

  var currentBasket = BasketMgr.getCurrentBasket();
  shippedBasketHelpers.ensureCorrectShippedLineItems(currentBasket, true);

  var basketModel = new CartModel(currentBasket);
  res.json(basketModel);

  next();
});

server.post('Remove', function (req, res, next) {
  // let's add a variable to session indicating user opted out
  req.session.privacyCache.set('shippedSuite', false);

  var currentBasket = BasketMgr.getCurrentBasket();
  shippedBasketHelpers.ensureCorrectShippedLineItems(currentBasket, false);

  var basketModel = new CartModel(currentBasket);
  res.json(basketModel);

  next();
});

module.exports = server.exports();
