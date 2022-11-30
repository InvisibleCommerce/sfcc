'use strict';

/**
 * Builds shipping adjustment payload for Shipped Suite API
 * @param {dw.order.Order} order - Order
 * @returns {Object} object containing shipping adjustment payload in Shipped Suite API format
 */

function buildShippingAdjustmentPayload(order) {
  var adjustmentObj = {};

  adjustmentObj.external_id = order.getUUID() + '-shipping';
  adjustmentObj.category = 'shipping';
  adjustmentObj.description = 'Shipping';
  adjustmentObj.amount = order.getAdjustedShippingTotalNetPrice().getValue();
  adjustmentObj.display_amount = order.getAdjustedShippingTotalNetPrice().getValue();
  adjustmentObj.discount = 0;
  adjustmentObj.display_discount = 0;
  adjustmentObj.tax = order.getAdjustedShippingTotalTax().getValue();
  adjustmentObj.display_tax = order.getAdjustedShippingTotalTax().getValue();

  return adjustmentObj;
}

module.exports = {
  buildShippingAdjustmentPayload: buildShippingAdjustmentPayload
};
