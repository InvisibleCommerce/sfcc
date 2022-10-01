'use strict';

var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');
var webService = require('~/cartridge/scripts/services/rest');
var VariantModel = require('~/cartridge/scripts/shipped/variantModel');

function buildProductPayload(product) {
  var category = !empty(product.getPrimaryCategory()) ? product.getPrimaryCategory().getDisplayName() : '';

  var productObj = {};
  productObj.brand = product.getBrand();
  productObj.category = category;
  productObj.description = !empty(product.getShortDescription()) ? product.getShortDescription().getMarkup() : '';
  // productObj.imageUrl = product.getImage(EXTEND_IMAGE_VIEW_TYPE, 0) ? product.getImage(EXTEND_IMAGE_VIEW_TYPE, 0).getAbsURL().toString() : '';
  productObj.name = product.getName();
  productObj.external_id = product.getID();
  productObj.images = buildImagesPayload(product);
  productObj.variants = buildVariantsPayload(product);

  return productObj;
}

function buildImagesPayload(product) {
  var imagesPayload = [];
  var imageViewType = 'medium';

  var images = product.getImages(imageViewType).toArray();
  for each (var image in images) {
    var url = image.getHttpsURL().toString();
    imagesPayload.push({
      external_id: url,
      url: url
    });
  }

  return imagesPayload;
}

function buildVariantsPayload(product) {
  var variants = [];
  if (!product.isMaster()) {
    variants.push(product);
  } else {
    variants = product.getVariants();
  }

  var variantsPayload = [];
  for each (var variant in variants) {
    var variantObj = VariantModel.buildVariantPayload(product, variant);

    variantsPayload.push(variantObj);
  }

  return variantsPayload;
}

module.exports = {
  buildProductPayload: buildProductPayload
};