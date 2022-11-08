'use strict';

function buildShippingAdjustmentPayload(order) {
  var adjustmentObj = {};

  adjustmentObj.external_id = order.getUUID() + '-shipping';
  adjustmentObj.category = 'shipping';
  adjustmentObj.description = 'Shipping';
  adjustmentObj.amount = order.getAdjustedShippingTotalNetPrice().getValue();
  adjustmentObj.discount = 0;
  adjustmentObj.tax = order.getAdjustedShippingTotalTax().getValue();

  return adjustmentObj;
}

module.exports = {
  buildShippingAdjustmentPayload: buildShippingAdjustmentPayload
};
