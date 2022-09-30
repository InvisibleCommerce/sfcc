/* eslint-disable no-continue */
/* eslint-disable linebreak-style */
/* global module */

var ProductMgr = require('dw/catalog/ProductMgr');
var Status = require('dw/system/Status');
var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');
var products = require('~/cartridge/scripts/shipped/products');

exports.execute = function () {
  var productsIterator = ProductMgr.queryAllSiteProducts();

  logger.info('Starting products sync...');
  logger.info(productsIterator.hasNext());

  var i = 0;
  while (productsIterator.hasNext()) {
    var product = productsIterator.next();
    products.syncProduct(product);
    i++;

    // break out early when testing
    // if (i > 20) {
    //   break;
    // }
  }

  productsIterator.close();
  logger.info('Products sync completed');

  return new Status(Status.OK, 'OK', 'Products Sync job completed');
};
