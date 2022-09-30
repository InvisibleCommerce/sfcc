'use strict';

var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');
var webService = require('~/cartridge/scripts/services/rest');
var ProductModel = require('~/cartridge/scripts/shipped/productModel');

function syncProduct(product) {
  if (product.isVariant()) return;
  if (product.isBundle()) return;
  if (!product.isOnline()) return;
  if (product.isVariationGroup()) return;

  var productObject = ProductModel.buildProductPayload(product);
  logger.info('syncing {0}', productObject.external_id);
  logger.info('resulting product object {0}', JSON.stringify(productObject));
  var response = webService.makeServiceRequest('upsertProduct', productObject);
  return response;
}

module.exports = {
  syncProduct: syncProduct
};
