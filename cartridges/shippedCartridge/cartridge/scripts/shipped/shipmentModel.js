'use strict';

var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');

function buildShipmentPayload(order, shipment) {
  var shipmentObj = {};

  shipmentObj.external_order_id = order.getOrderNo();
  shipmentObj.external_id = shipment.getShipmentNo();
  shipmentObj.courier_name = 'FedEx'; // TODO: is there a carrier available...?
  shipmentObj.tracking_number = shipment.getTrackingNumber();
  shipmentObj.fulfilled_at = shipment.getCreationDate().toISOString();
  shipmentObj.shipment_items = buildShipmentItemsPayload(shipment);

  return shipmentObj;
}

function buildShipmentItemsPayload(shipment) {
  var shipmentItemsPayload = [];
  var productLineItems = shipment.getProductLineItems();

  productLineItems.toArray().forEach(function (productLineItem) {
    var shipmentItemObj = {};
    shipmentItemObj.external_id = productLineItem.getUUID() + '-shipment-item';
    shipmentItemObj.external_order_item_id = productLineItem.getUUID();
    shipmentItemObj.quantity = productLineItem.getQuantityValue();

    shipmentItemsPayload.push(shipmentItemObj);
  });

  return shipmentItemsPayload;
}

module.exports = {
  buildShipmentPayload: buildShipmentPayload
};
