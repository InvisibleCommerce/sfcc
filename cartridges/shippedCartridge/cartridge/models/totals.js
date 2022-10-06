'use strict';

var base = module.superModule;
var formatMoney = require('dw/util/StringUtils').formatMoney;

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
  var shippedPriceAdjustment = lineItemContainer.getPriceAdjustmentByPromotionID('shipped-shield');
  if (!empty(shippedPriceAdjustment)) {
    orderDiscount = orderDiscount.add(shippedPriceAdjustment.getPrice());
  }
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

    var shippedPriceAdjustment = lineItemContainer.getPriceAdjustmentByPromotionID('shipped-shield');
    if (empty(shippedPriceAdjustment)) {
      this.shippedTotal = {
        value: 0,
        formatted: '-'
      };
    } else {
      var shippedTotal = shippedPriceAdjustment.getPrice();
      this.shippedTotal = {
        value: shippedTotal.value,
        formatted: formatMoney(shippedTotal)
      };
    }
  } else {
    this.shippedTotal = '-';
  }
}

totals.prototype = Object.create(base.prototype);

module.exports = totals;
