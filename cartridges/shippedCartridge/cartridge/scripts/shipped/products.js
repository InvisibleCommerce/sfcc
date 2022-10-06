'use strict';

var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');
var webService = require('~/cartridge/scripts/services/shippedRest');
var ProductModel = require('~/cartridge/scripts/shipped/productModel');

function syncMasterProduct(product) {
  if (product.isVariant()) return;
  if (product.isBundle()) return;
  if (!product.isOnline()) return;
  if (product.isVariationGroup()) return;

  var productObject = ProductModel.buildProductPayload(product);
  logger.info('syncing product {0}', productObject.external_id);
  logger.info('resulting product object {0}', JSON.stringify(productObject));
  var response = webService.makeServiceRequest('upsertProduct', productObject);
  return response;
}

function syncProduct(product) {
  var masterProduct = product;
  if (product.isVariant()) {
    masterProduct = product.getMasterProduct();
  }

  return syncMasterProduct(masterProduct);
}

module.exports = {
  syncProduct: syncProduct,
  syncMasterProduct: syncMasterProduct
};
