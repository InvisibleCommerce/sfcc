/* eslint-disable no-continue */
/* eslint-disable linebreak-style */
/* global module */

var ProductMgr = require('dw/catalog/ProductMgr');
var Status = require('dw/system/Status');
var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');
var products = require('~/cartridge/scripts/shipped/products');

/**
 * @function execute
 * @returns {dw.system.Status}
 * @author mdinca
 */

exports.execute = function () {
  var productsIterator = ProductMgr.queryAllSiteProducts();

  logger.info('Starting processing new products...');
  logger.info(productsIterator.hasNext());

  while (productsIterator.hasNext()) {
    var product = productsIterator.next();
    products.syncProduct(product);
  }

  productsIterator.close();

  return new Status(Status.OK, 'OK', 'Products Sync job completed');
};
