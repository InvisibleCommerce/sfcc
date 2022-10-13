'use strict';

var app = require('*/cartridge/scripts/app');
var guard = require('*/cartridge/scripts/guard');

var shippedBasketHelpers = require('int_shipped/cartridge/scripts/helpers/shippedBasketHelpers');
var BasketMgr = require('dw/order/BasketMgr');
var Response = require('*/cartridge/scripts/util/Response');
var Locale = require('dw/util/Locale');

// function buildCheckoutResponse(currentBasket, req, res) {
//   var currentCustomer = req.currentCustomer.raw;
//   var usingMultiShipping = req.session.privacyCache.get('usingMultiShipping');
//   var allValid = COHelpers.ensureValidShipments(currentBasket);
//   var currentLocale = Locale.getLocale(req.locale.id);
//   var accountModel = new AccountModel(req.currentCustomer);
//
//   COHelpers.recalculateBasket(currentBasket);
//
//   var orderModel = new OrderModel(
//     currentBasket,
//     {
//       customer: currentCustomer,
//       usingMultiShipping: usingMultiShipping,
//       shippable: allValid,
//       countryCode: currentLocale.country,
//       containerView: 'basket'
//     }
//   );
//
//   res.json({ order: orderModel, customer: accountModel });
// }

function add() {
  // let's add a variable to session indicating user opted in
  session.getPrivacy().shippedSuite = true;

  var currentBasket = BasketMgr.getCurrentBasket();
  shippedBasketHelpers.ensureCorrectShippedLineItems(currentBasket, true);

  // buildCheckoutResponse(currentBasket);
  Response.renderJSON({
    success: true
  });
}

function remove() {
  // let's add a variable to session indicating user opted out
  session.getPrivacy().shippedSuite = false;

  var currentBasket = BasketMgr.getCurrentBasket();
  shippedBasketHelpers.ensureCorrectShippedLineItems(currentBasket, false);

  // buildCheckoutResponse(currentBasket);
  Response.renderJSON({
    success: true
  });
}

exports.Add = guard.ensure(['post', 'https'], add);
exports.Remove = guard.ensure(['post', 'https'], remove);
