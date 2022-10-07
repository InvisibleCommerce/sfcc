var server = require('server');
var shippedBasketHelpers = require('~/cartridge/scripts/helpers/shippedBasketHelpers');
var BasketMgr = require('dw/order/BasketMgr');
var CartModel = require('*/cartridge/models/cart');
var AccountModel = require('*/cartridge/models/account');
var OrderModel = require('*/cartridge/models/order');
var Locale = require('dw/util/Locale');
var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

function buildCheckoutResponse(currentBasket, req, res) {
  var currentCustomer = req.currentCustomer.raw;
  var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
  var allValid = COHelpers.ensureValidShipments(currentBasket);
  var currentLocale = Locale.getLocale(req.locale.id);
  var accountModel = new AccountModel(req.currentCustomer);

  COHelpers.recalculateBasket(currentBasket);

  var orderModel = new OrderModel(
    currentBasket,
    {
      customer: currentCustomer,
      usingMultiShipping: usingMultiShipping,
      shippable: allValid,
      countryCode: currentLocale.country,
      containerView: 'basket'
    }
  );

  res.json({ order: orderModel, customer: accountModel });
}

server.post('Add', function (req, res, next) {
  // let's add a variable to session indicating user opted in
  req.session.privacyCache.set('shippedSuite', true);

  var currentBasket = BasketMgr.getCurrentBasket();
  shippedBasketHelpers.ensureCorrectShippedLineItems(currentBasket, true);

  // var basketModel = new CartModel(currentBasket);
  // res.json(basketModel);

  buildCheckoutResponse(currentBasket, req, res);

  next();
});

server.post('Remove', function (req, res, next) {
  // let's add a variable to session indicating user opted out
  req.session.privacyCache.set('shippedSuite', false);

  var currentBasket = BasketMgr.getCurrentBasket();
  shippedBasketHelpers.ensureCorrectShippedLineItems(currentBasket, false);

  // var basketModel = new CartModel(currentBasket);
  // res.json(basketModel);

  buildCheckoutResponse(currentBasket, req, res);

  next();
});

module.exports = server.exports();
