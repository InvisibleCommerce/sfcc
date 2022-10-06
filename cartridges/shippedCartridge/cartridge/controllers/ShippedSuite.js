const server = require('server');
var shippedBasketHelpers = require('~/cartridge/scripts/helpers/shippedBasketHelpers');
var BasketMgr = require('dw/order/BasketMgr');

server.post('Add', function (req, res, next) {
  // let's add a variable to session indicating user opted in
  req.session.privacyCache.set('shippedSuite', true);

  var currentBasket = BasketMgr.getCurrentBasket();
  shippedBasketHelpers.ensureCorrectShippedLineItems(currentBasket, true);

  res.json({ status: 'added', session: req.session.privacyCache.shippedSuite });
  next();
});

server.post('Remove', function (req, res, next) {
  // let's add a variable to session indicating user opted out
  req.session.privacyCache.set('shippedSuite', false);

  var currentBasket = BasketMgr.getCurrentBasket();
  shippedBasketHelpers.ensureCorrectShippedLineItems(currentBasket, false);

  res.json({ status: 'removed', session: req.session.privacyCache.shippedSuite });
  next();
});

module.exports = server.exports();
