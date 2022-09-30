'use strict';

var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');
var webService = require('~/cartridge/scripts/services/rest');
var OrderModel = require('~/cartridge/scripts/shipped/orderModel');

function syncOrder(order) {
  // if (product.isVariant()) return;
  // if (product.isBundle()) return;
  // if (!product.isOnline()) return;
  // if (product.isVariationGroup()) return;

  var orderObject = OrderModel.buildOrderPayload(order);
  logger.info('syncing {0}', orderObject.external_id);
  logger.info('resulting product object {0}', JSON.stringify(orderObject));
  var response = webService.makeServiceRequest('upsertOrder', orderObject);
  return response;
}

module.exports = {
  syncOrder: syncOrder
};
