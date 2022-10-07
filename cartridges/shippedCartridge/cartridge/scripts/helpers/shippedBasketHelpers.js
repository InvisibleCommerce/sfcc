'use strict';

var Transaction = require('dw/system/Transaction');
var webService = require('~/cartridge/scripts/services/shippedRest');
var shippedConstants = require('~/cartridge/scripts/shipped/constants');
var Site = require('dw/system/Site').getCurrent();
var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');

function calculateTotalPrice(currentBasket) {
  var basketTotal = currentBasket.merchandizeTotalNetPrice.value;

  return basketTotal;
}

function calculateShippedFees(currentBasket) {
  var totalPrice = calculateTotalPrice(currentBasket);
  var response = webService.makeServiceRequest('getOffers', { order_value: totalPrice });

  var fees = {};
  if (Site.getCustomPreferenceValue('shippedShield')) {
    fees[shippedConstants.SHIPPED_SHIELD_ID] = parseFloat(response.shield_fee);
  } else {
    fees[shippedConstants.SHIPPED_SHIELD_ID] = 0;
  }
  if (Site.getCustomPreferenceValue('shippedGreen')) {
    fees[shippedConstants.SHIPPED_GREEN_ID] = parseFloat(response.green_fee);
  } else {
    fees[shippedConstants.SHIPPED_GREEN_ID] = 0;
  }

  return fees;
}

function removeShippedOrderPriceAdjustments(currentBasket) {
  shippedConstants.SHIPPED_IDS.forEach(function (shippedId) {
    var existingPriceAdjustment = currentBasket.getPriceAdjustmentByPromotionID(shippedId);
    if (empty(existingPriceAdjustment)) return;

    Transaction.wrap(function () {
      currentBasket.removePriceAdjustment(existingPriceAdjustment);
    });
  });
}

function addShippedOrderPriceAdjustment(currentBasket) {
  var orderPriceAdjustment;
  var shippedFees = calculateShippedFees(currentBasket);

  shippedConstants.SHIPPED_IDS.forEach(function (shippedId) {
    var shippedFee = shippedFees[shippedId];
    if (shippedFee <= 0) return;

    Transaction.wrap(function () {
      orderPriceAdjustment = currentBasket.createPriceAdjustment(shippedId);
      orderPriceAdjustment.setPriceValue(shippedFee);
      orderPriceAdjustment.setLineItemText(shippedConstants.SHIPPED_NAMES[shippedId]);
    });
  });
}

function ensureCorrectShippedLineItems(lineItemsContainer, shippedSelected) {
  // remove any existing items first
  removeShippedOrderPriceAdjustments(lineItemsContainer);

  // add relevant items
  if (shippedSelected) {
    addShippedOrderPriceAdjustment(lineItemsContainer);
  }
}

module.exports = {
  ensureCorrectShippedLineItems: ensureCorrectShippedLineItems,
  removeShippedOrderPriceAdjustments: removeShippedOrderPriceAdjustments
};
