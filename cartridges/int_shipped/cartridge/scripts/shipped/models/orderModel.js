'use strict';

var OrderItemModel = require('~/cartridge/scripts/shipped/models/orderItemModel');
var ShippingAddressModel = require('~/cartridge/scripts/shipped/models/shippingAddressModel');
var CustomerModel = require('~/cartridge/scripts/shipped/models/customerModel');
var TransactionModel = require('~/cartridge/scripts/shipped/models/transactionModel');
var ShippingAdjustmentModel = require('~/cartridge/scripts/shipped/models/shippingAdjustmentModel');
var shippedConstants = require('~/cartridge/scripts/shipped/constants');

/**
 * Builds array of transaction payloads for Shipped Suite API
 * @param {dw.order.Order} order - Order
 * @returns {Array} transaction payloads in Shipped Suite API format
 */

function buildTransactionsPayload(order) {
  var paymentInstruments = order.getPaymentInstruments();

  var transactionsPayload = [];
  paymentInstruments.toArray().forEach(function (paymentInstrument) {
    var transactionObj = TransactionModel.buildTransactionPayload(paymentInstrument);

    transactionsPayload.push(transactionObj);
  });

  return transactionsPayload;
}

/**
 * Maps fulfillment status to Shipped Suite API
 * @param {dw.order.Order} order - Order
 * @returns {String} Shipped Suite API fulfillment status
 */

function getFulfillmentStatus(order) {
  switch (order.getShippingStatus().getValue()) {
    case 0: // not shipped
      return 'pending';
    case 1: // partially shipped
      return 'partial';
    case 2: // shipped
      return 'fulfilled';
  }
}

/**
 * Maps payment status to Shipped Suite API
 * @param {dw.order.Order} order - Order
 * @returns {String} Shipped Suite API payment status
 */

function getPaymentStatus(order) {
  switch (order.getPaymentStatus().getValue()) {
    case 0: // not paid
      return 'pending';
    case 1: // partially paid
      return 'partially_paid';
    case 2: // paid
      return 'paid';
  }
}

/**
 * Builds shipping adjustment payload for Shipped Suite API
 * @param {dw.order.Order} order - Order
 * @returns {Object} shipping adjustment payload in Shipped Suite API format
 */

function buildShippingAdjustmentsPayload(order) {
  var shippingAdjustmentObj = ShippingAdjustmentModel.buildShippingAdjustmentPayload(order);

  return shippingAdjustmentObj;
}

/**
 * Builds array of order item payloads for Shipped Suite API
 * @param {dw.order.Order} order - Order
 * @returns {Array} order item payloads in Shipped Suite API format
 */

function buildOrderItemsPayload(order) {
  var orderItems = order.getAllProductLineItems();

  var orderItemsPayload = [];
  orderItems.toArray().forEach(function (orderItem) {
    if (orderItem.isOptionProductLineItem()) return;
    if (orderItem.isBundledProductLineItem()) return;

    var orderItemObj = OrderItemModel.buildOrderItemPayload(orderItem);

    orderItemsPayload.push(orderItemObj);
  });

  return orderItemsPayload;
}

/**
 * Determines whether Shipped Shield is applicable on order
 * @param {dw.order.Order} order - Order
 * @returns {Boolean}
 */

function getShieldSelection(order) {
  // this checks for order-level price adjustment method
  var priceAdjustment = order.getPriceAdjustmentByPromotionID(shippedConstants.SHIPPED_SHIELD_ID);
  if (!empty(priceAdjustment)) return true;

  return false;
}

/**
 * Determines the amount that the customer was charged for Shield
 * @param {dw.order.Order} order - Order
 * @returns {Number}
 */

function getShieldAmount(order) {
  // this checks for order-level price adjustment method
  var priceAdjustment = order.getPriceAdjustmentByPromotionID(shippedConstants.SHIPPED_SHIELD_ID);
  if (empty(priceAdjustment)) return 0;

  return priceAdjustment.getPrice().getValue();
}

/**
 * Determines whether Shipped Green is applicable on order
 * @param {dw.order.Order} order - Order
 * @returns {Boolean}
 */

function getGreenSelection(order) {
  // this checks for order-level price adjustment method
  var priceAdjustment = order.getPriceAdjustmentByPromotionID(shippedConstants.SHIPPED_GREEN_ID);
  if (!empty(priceAdjustment)) return true;

  return false;
}

/**
 * Determines the amount that the customer was charged for Green
 * @param {dw.order.Order} order - Order
 * @returns {Number}
 */

function getGreenAmount(order) {
  // this checks for order-level price adjustment method
  var priceAdjustment = order.getPriceAdjustmentByPromotionID(shippedConstants.SHIPPED_GREEN_ID);
  if (empty(priceAdjustment)) return 0;

  return priceAdjustment.getPrice().getValue();
}

/**
 * Determines whether or not taxes are being included in the price
 * @param {dw.order.Order} order - Order
 * @returns {Boolean}
 */

function areTaxesIncluded(order) {
  var price = order.getAdjustedMerchandizeTotalPrice().getValue();
  var netPrice = order.getAdjustedMerchandizeTotalNetPrice().getValue();

  return price > netPrice;
}

/**
 * Builds order payload for Shipped Suite API
 * @param {dw.order.Order} order - Order
 * @returns {Object} object containing order payload in Shipped Suite API format
 */

function buildOrderPayload(order) {
  var orderObj = {};

  orderObj.number = order.getOrderNo();
  orderObj.email = order.getCustomerEmail();
  orderObj.external_id = order.getOrderNo();
  orderObj.placed_at = order.getCreationDate().toISOString();
  // orderObj.canceled_at
  orderObj.payment_status = getPaymentStatus(order);
  orderObj.fulfillment_status = getFulfillmentStatus(order);
  orderObj.customer = CustomerModel.buildCustomerPayload(order, order.getCustomer());
  var shippingAddress = order.getDefaultShipment().getShippingAddress();
  orderObj.shipping_address = ShippingAddressModel.buildShippingAddressPayload(shippingAddress);
  orderObj.order_items = buildOrderItemsPayload(order);
  orderObj.order_adjustments = [];
  orderObj.order_adjustments.push(buildShippingAdjustmentsPayload(order));
  orderObj.transactions = buildTransactionsPayload(order);
  orderObj.shield_selected = getShieldSelection(order);
  orderObj.shield_display_fee = getShieldAmount(order);
  orderObj.green_selected = getGreenSelection(order);
  orderObj.green_display_fee = getGreenAmount(order);
  orderObj.display_currency = order.getCurrencyCode();
  orderObj.transaction_currency = order.getCurrencyCode();
  orderObj.taxes_included = areTaxesIncluded(order);

  return orderObj;
}

module.exports = {
  buildOrderPayload: buildOrderPayload
};
