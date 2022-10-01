'use strict';

var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');
var OrderItemModel = require('~/cartridge/scripts/shipped/orderItemModel');
var ShippingAddressModel = require('~/cartridge/scripts/shipped/shippingAddressModel');
var CustomerModel = require('~/cartridge/scripts/shipped/customerModel');
var TransactionModel = require('~/cartridge/scripts/shipped/transactionModel');
var ShippingAdjustmentModel = require('~/cartridge/scripts/shipped/shippingAdjustmentModel');

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
  var shippingAddress = order.getDefaultShipment().getShippingAddress()
  orderObj.shipping_address = ShippingAddressModel.buildShippingAddressPayload(shippingAddress);
  orderObj.order_items = buildOrderItemsPayload(order);
  orderObj.order_adjustments = []
  orderObj.order_adjustments.push(buildShippingAdjustmentsPayload(order));
  orderObj.transactions = buildTransactionsPayload(order);
  orderObj.shield_selected = getShieldSelection(order);
  orderObj.green_selected = getGreenSelection(order);

  return orderObj;
}

function buildTransactionsPayload(order) {
  var paymentInstruments = order.getPaymentInstruments();

  var transactionsPayload = [];
  for each (var paymentInstrument in paymentInstruments) {
    var transactionObj = TransactionModel.buildTransactionPayload(paymentInstrument);

    transactionsPayload.push(transactionObj);
  }

  return transactionsPayload;
}

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

function buildShippingAdjustmentsPayload(order) {
  var shippingAdjustmentObj = ShippingAdjustmentModel.buildShippingAdjustmentPayload(order);

  return shippingAdjustmentObj;
}

function buildOrderItemsPayload(order) {
  var orderItems = order.getAllProductLineItems();

  var orderItemsPayload = [];
  for each (var orderItem in orderItems) {
    if (orderItem.isOptionProductLineItem()) continue;
    if (orderItem.isBundledProductLineItem()) continue;

    var orderItemObj = OrderItemModel.buildOrderItemPayload(orderItem);

    orderItemsPayload.push(orderItemObj);
  }

  return orderItemsPayload;
}

function getShieldSelection(order) {
  var orderItems = order.getAllProductLineItems();

  for each (var orderItem in orderItems) {
    if (OrderItemModel.isShield(orderItem)) {
      return true;
    }
  }

  return false;
}

function getGreenSelection(order) {
  var orderItems = order.getAllProductLineItems();

  for each (var orderItem in orderItems) {
    if (OrderItemModel.isGreen(orderItem)) {
      return true;
    }
  }

  return false;
}

module.exports = {
  buildOrderPayload: buildOrderPayload
};
