/* eslint-disable no-continue */
/* eslint-disable linebreak-style */
/* global module */

var OrderMgr = require('dw/order/OrderMgr');
var Status = require('dw/system/Status');
var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');
var shipments = require('~/cartridge/scripts/shipped/shipments');

exports.execute = function () {
  logger.info('Starting shipments sync...');

  var order = OrderMgr.getOrder('00000201');
  var shipment = order.getShipments().toArray()[0];
  shipments.syncShipment(order, shipment);

  logger.info('Shipments sync completed');

  return new Status(Status.OK, 'OK', 'Shipments Sync job completed');
};
