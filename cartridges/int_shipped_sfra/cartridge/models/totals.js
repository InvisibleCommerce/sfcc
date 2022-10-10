'use strict';

var base = module.superModule;
var formatMoney = require('dw/util/StringUtils').formatMoney;
var shippedConstants = require('int_shipped/cartridge/scripts/shipped/constants');
var Money = require('dw/value/Money');

/**
 * Gets the order discount amount by subtracting the basket's total including the discount from
 *      the basket's total excluding the order discount.
 * @param {dw.order.LineItemCtnr} lineItemContainer - Current users's basket
 * @returns {Object} an object that contains the value and formatted value of the order discount
 */
function getOrderLevelDiscountTotal(lineItemContainer) {
  var totalExcludingOrderDiscount = lineItemContainer.getAdjustedMerchandizeTotalPrice(false);
  var totalIncludingOrderDiscount = lineItemContainer.getAdjustedMerchandizeTotalPrice(true);
  var orderDiscount = totalExcludingOrderDiscount.subtract(totalIncludingOrderDiscount);

  // SHIPPED EXTENSION START
  shippedConstants.SHIPPED_IDS.forEach(function (shippedId) {
    var shippedPriceAdjustment = lineItemContainer.getPriceAdjustmentByPromotionID(shippedId);
    if (empty(shippedPriceAdjustment)) return;

    orderDiscount = orderDiscount.add(shippedPriceAdjustment.getPrice());
  });
  // SHIPPED EXTENSION END

  return {
    value: orderDiscount.value,
    formatted: formatMoney(orderDiscount)
  };
}

/**
 * @constructor
 * @classdesc totals class that represents the order totals of the current line item container
 *
 * @param {dw.order.lineItemContainer} lineItemContainer - The current user's line item container
 */
function totals(lineItemContainer) {
  base.call(this, lineItemContainer);

  if (lineItemContainer) {
    this.orderLevelDiscountTotal = getOrderLevelDiscountTotal(lineItemContainer);

    var shippedTotal = 0;
    shippedConstants.SHIPPED_IDS.forEach(function (shippedId) {
      var shippedPriceAdjustment = lineItemContainer.getPriceAdjustmentByPromotionID(shippedId);
      if (empty(shippedPriceAdjustment)) return;

      shippedTotal += shippedPriceAdjustment.getPriceValue();
    });

    var shippedTotalMoney = new Money(shippedTotal, lineItemContainer.getCurrencyCode());
    this.shippedTotal = {
      value: shippedTotalMoney.value,
      formatted: formatMoney(shippedTotalMoney)
    };
  } else {
    this.shippedTotal = '-';
  }
}

totals.prototype = Object.create(base.prototype);

module.exports = totals;
