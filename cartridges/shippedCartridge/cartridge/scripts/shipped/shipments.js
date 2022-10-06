'use strict';

var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');
var webService = require('~/cartridge/scripts/services/shippedRest');
var ShipmentModel = require('~/cartridge/scripts/shipped/models/shipmentModel');

function syncShipment(order, shipment) {
  if (shipment.getShippingStatus() == 0) return;

  var shipmentObject = ShipmentModel.buildShipmentPayload(order, shipment);
  logger.info('syncing {0}', shipmentObject.external_id);
  logger.info('resulting shipment object {0}', JSON.stringify(shipmentObject));
  var response = webService.makeServiceRequest('upsertShipment', shipmentObject);
  return response;
}

module.exports = {
  syncShipment: syncShipment
};
