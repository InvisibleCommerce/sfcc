var server = require('server');
var shippedBasketHelpers = require('int_shipped/cartridge/scripts/helpers/shippedBasketHelpers');
var BasketMgr = require('dw/order/BasketMgr');
var AccountModel = require('*/cartridge/models/account');
var OrderModel = require('*/cartridge/models/order');
var Locale = require('dw/util/Locale');
var COHelpers = require('*/cartridge/scripts/checkout/checkoutHelpers');

/**
 * Builds the checkout response JSON for new/updated basket
 * @param {dw.order.Basket} currentBasket - Current user's basket
 * @param {dw.system.Request} req - Request
 * @param {dw.system.Response} res - Response
 */

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

/**
 * Handle adding Shipped service to cart
 */

server.post('Add', function (req, res, next) {
  // let's add a variable to session indicating user opted in
  req.session.privacyCache.set('shippedSuite', true);

  var currentBasket = BasketMgr.getCurrentBasket();
  shippedBasketHelpers.ensureCorrectShippedLineItems(currentBasket, true);

  buildCheckoutResponse(currentBasket, req, res);

  next();
});

/**
 * Handle removing Shipped service from cart
 */

server.post('Remove', function (req, res, next) {
  // let's add a variable to session indicating user opted out
  req.session.privacyCache.set('shippedSuite', false);

  var currentBasket = BasketMgr.getCurrentBasket();
  shippedBasketHelpers.ensureCorrectShippedLineItems(currentBasket, false);

  buildCheckoutResponse(currentBasket, req, res);

  next();
});

module.exports = server.exports();
