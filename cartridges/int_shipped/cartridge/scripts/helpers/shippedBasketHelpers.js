'use strict';

var Transaction = require('dw/system/Transaction');
var webService = require('~/cartridge/scripts/services/shippedRest');
var shippedConstants = require('~/cartridge/scripts/shipped/constants');
var Site = require('dw/system/Site').getCurrent();
var Money = require('dw/value/Money');

/**
 * Calculates total amount of Shipped fees on the current basket
 * @param {dw.order.Basket} currentBasket - Current user's basket
 * @returns {dw.value.Money} object containing the total Shipped fees
 */

function calculateCurrentTotalShippedFee(currentBasket) {
  var shippedTotal = new Money(0, currentBasket.getCurrencyCode());
  shippedConstants.SHIPPED_IDS.forEach(function (shippedId) {
    var shippedPriceAdjustment = currentBasket.getPriceAdjustmentByPromotionID(shippedId);
    if (empty(shippedPriceAdjustment)) return;

    shippedTotal = shippedTotal.add(shippedPriceAdjustment.getPrice());
  });

  return shippedTotal;
}

/**
 * Calculates total order value of basket as applicable to Shipped
 * @param {dw.order.Basket} currentBasket - Current user's basket
 * @returns {Number} total order value of basket as applicable to Shipped
 */

function calculateTotalPrice(currentBasket) {
  var basketTotal = currentBasket.merchandizeTotalNetPrice.value;

  return basketTotal;
}

/**
 * Calculates Shipped fees applicable to a basket
 * @param {dw.order.Basket} currentBasket - Current user's basket
 * @returns {Object} with fees for each Shipped product
 */

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

/**
 * Removes existing Shipped PriceAdjustments from basket
 * @param {dw.order.Basket} currentBasket - Current user's basket
 */

function removeShippedOrderPriceAdjustments(currentBasket) {
  shippedConstants.SHIPPED_IDS.forEach(function (shippedId) {
    var existingPriceAdjustment = currentBasket.getPriceAdjustmentByPromotionID(shippedId);
    if (empty(existingPriceAdjustment)) return;

    Transaction.wrap(function () {
      currentBasket.removePriceAdjustment(existingPriceAdjustment);
    });
  });
}

/**
 * Adds Shipped PriceAdjustments to basket
 * @param {dw.order.Basket} currentBasket - Current user's basket
 */

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

/**
 * Ensures consistency/correctness of Shipped PriceAdjustments on the basket
 * @param {dw.order.LineItemCtnr} lineItemsContainer - Current user's basket
 * @param {Boolean} shippedSelected - Whether or not Shipped has been selected
 */

function ensureCorrectShippedLineItems(lineItemsContainer, shippedSelected) {
  // remove any existing items first
  removeShippedOrderPriceAdjustments(lineItemsContainer);

  // add relevant items
  if (shippedSelected) {
    addShippedOrderPriceAdjustment(lineItemsContainer);
  }
}

module.exports = {
  calculateCurrentTotalShippedFee: calculateCurrentTotalShippedFee,
  ensureCorrectShippedLineItems: ensureCorrectShippedLineItems,
  removeShippedOrderPriceAdjustments: removeShippedOrderPriceAdjustments
};
