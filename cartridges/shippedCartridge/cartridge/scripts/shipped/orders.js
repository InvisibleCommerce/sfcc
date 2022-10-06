'use strict';

var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');
var webService = require('~/cartridge/scripts/services/shippedRest');
var OrderModel = require('~/cartridge/scripts/shipped/orderModel');
var products = require('~/cartridge/scripts/shipped/products');

function syncOrder(order) {
  var orderObject = OrderModel.buildOrderPayload(order);
  logger.info('syncing order {0}', orderObject.external_id);

  // first sync its products
  syncProducts(order);

  logger.info('resulting order object {0}', JSON.stringify(orderObject));
  var response = webService.makeServiceRequest('upsertOrder', orderObject);
  logger.info('response: {0}', response);
  return response;
}

function syncProducts(order) {
  for each (var productLineItem in order.getAllProductLineItems()) {
    var product = productLineItem.getProduct();
    if (empty(product)) continue;

    var response = products.syncProduct(product);
    logger.info('response {0}', JSON.stringify(response));
  }
}

module.exports = {
  syncOrder: syncOrder
};
