'use strict';

var Site = require('dw/system/Site').getCurrent();
var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');
var webService = require('~/cartridge/scripts/services/rest');

/**
 * Get products payload for specific API version
 * @param {Product} product - product
 * @returns {Object} productObj - payload object for request
 */
function getProductPayload(product) {
  var imageViewType = 'medium';

  var category = !empty(product.getPrimaryCategory()) ? product.getPrimaryCategory().getDisplayName() : '';

  var productObj = {};
  productObj.brand = product.getBrand();
  productObj.category = category;
  productObj.description = !empty(product.getShortDescription()) ? product.getShortDescription().getMarkup() : '';
  // productObj.imageUrl = product.getImage(EXTEND_IMAGE_VIEW_TYPE, 0) ? product.getImage(EXTEND_IMAGE_VIEW_TYPE, 0).getAbsURL().toString() : '';
  productObj.name = product.getName();
  productObj.external_id = product.getID();
  productObj.images = [];
  var images = product.getImages(imageViewType).toArray();
  for each (var image in images) {
    var url = image.getHttpsURL().toString();
    productObj.images.push({
      external_id: url,
      url: url
    });
  }

  var variants = [];
  if (!product.isMaster()) {
    variants.push(product);
  } else {
    variants = product.getVariants();
  }

  productObj.variants = [];
  for each (var variant in variants) {
    var variantObj = {};
    if (variant.isVariant()) {
      var variationModel = variant.getVariationModel();
      var variationAttributes = variationModel.getProductVariationAttributes();
      var names = [];
      for each (var variationAttribute in variationAttributes) {
        names.push(variationModel.getSelectedValue(variationAttribute).displayValue)
      }
      variantObj.name = names.join(' / ');
    } else {
      variantObj.name = variant.getName() == product.getName() ? '' : variant.getName();
    }
    variantObj.barcode = !empty(variant.getUPC()) ? variant.getUPC() : variant.getEAN();
    variantObj.sku = variant.getID();
    var price = variant.priceModel.price.available && variant.priceModel.price.value > 0 ? variant.priceModel.price.value : 0;
    variantObj.price = price;
    variantObj.external_id = variant.getID();

    productObj.variants.push(variantObj);
  }

  return productObj;
}

/**
 * Get products payload and make call on products endpoint
 * @param {Product} product - product
 * @returns {Object} - response object
 */
function syncProduct(product) {
  if (product.isVariant()) return;
  if (product.isBundle()) return;
  if (!product.isOnline()) return;
  if (product.isVariationGroup()) return;

  var productObject = getProductPayload(product);
  logger.info('syncing {0}', productObject.external_id);
  // logger.info('resulting product object {0}', JSON.stringify(productObject));
  var response = webService.upsertProduct(productObject);
  return response;
}

module.exports = {
  syncProduct: syncProduct
};
