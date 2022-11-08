'use strict';

var guard = require('*/cartridge/scripts/guard');

var shippedBasketHelpers = require('int_shipped/cartridge/scripts/helpers/shippedBasketHelpers');
var BasketMgr = require('dw/order/BasketMgr');
var Response = require('*/cartridge/scripts/util/Response');

function add() {
  // let's add a variable to session indicating user opted in
  session.getPrivacy().shippedSuite = true;

  var currentBasket = BasketMgr.getCurrentBasket();
  shippedBasketHelpers.ensureCorrectShippedLineItems(currentBasket, true);

  Response.renderJSON({
    success: true
  });
}

function remove() {
  // let's add a variable to session indicating user opted out
  session.getPrivacy().shippedSuite = false;

  var currentBasket = BasketMgr.getCurrentBasket();
  shippedBasketHelpers.ensureCorrectShippedLineItems(currentBasket, false);

  Response.renderJSON({
    success: true
  });
}

exports.Add = guard.ensure(['post', 'https'], add);
exports.Remove = guard.ensure(['post', 'https'], remove);
