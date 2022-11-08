'use strict';

var VariantModel = require('~/cartridge/scripts/shipped/models/variantModel');

function buildImagesPayload(product) {
  var imagesPayload = [];
  var imageViewType = 'medium';

  var images = product.getImages(imageViewType).toArray();
  images.forEach(function (image) {
    var url = image.getHttpsURL().toString();
    imagesPayload.push({
      external_id: url,
      url: url
    });
  });

  return imagesPayload;
}

function buildVariantsPayload(product) {
  var variants = [];
  if (!product.isMaster()) {
    variants.push(product);
  } else {
    variants = product.getVariants().toArray();
  }

  var variantsPayload = [];
  variants.forEach(function (variant) {
    var variantObj = VariantModel.buildVariantPayload(product, variant);

    variantsPayload.push(variantObj);
  });

  return variantsPayload;
}

function buildProductPayload(product) {
  var category = !empty(product.getPrimaryCategory()) ? product.getPrimaryCategory().getDisplayName() : '';

  var productObj = {};
  productObj.brand = product.getBrand();
  productObj.category = category;
  productObj.description = !empty(product.getShortDescription()) ? product.getShortDescription().getMarkup() : '';
  productObj.name = product.getName();
  productObj.external_id = product.getID();
  productObj.images = buildImagesPayload(product);
  productObj.variants = buildVariantsPayload(product);

  return productObj;
}

module.exports = {
  buildProductPayload: buildProductPayload
};
