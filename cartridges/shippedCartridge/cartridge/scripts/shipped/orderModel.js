'use strict';

var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');
var webService = require('~/cartridge/scripts/services/rest');
var OrderItemModel = require('~/cartridge/scripts/shipped/orderItemModel');
var ShippingAddressModel = require('~/cartridge/scripts/shipped/shippingAddressModel');
var CustomerModel = require('~/cartridge/scripts/shipped/customerModel');

function buildOrderPayload(order) {
  var orderObj = {};

  orderObj.number = order.getOrderNo();
  orderObj.email = order.getCustomerEmail();
  orderObj.external_id = order.getOrderNo();
  orderObj.placed_at = order.getCreationDate().toISOString();
  // orderObj.canceled_at
  orderObj.payment_status = order.getPaymentStatus().getDisplayValue();
  orderObj.fulfillment_status = order.getShippingStatus().getDisplayValue();
  orderObj.customer = CustomerModel.buildCustomerPayload(order, order.getCustomer());
  var shippingAddress = order.getDefaultShipment().getShippingAddress()
  orderObj.shipping_address = ShippingAddressModel.buildShippingAddressPayload(shippingAddress);
  orderObj.order_items = buildOrderItemsPayload(order);

  return orderObj;
}

function buildOrderItemsPayload(order) {
  var orderItems = order.getAllProductLineItems();

  var orderItemsPayload = [];
  for each (var orderItem in orderItems) {
    var orderItemObj = OrderItemModel.buildOrderItemPayload(orderItem);

    orderItemsPayload.push(orderItemObj);
  }

  return orderItemsPayload;
}

module.exports = {
  buildOrderPayload: buildOrderPayload
};
