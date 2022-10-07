'use strict';

var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');

function buildVariantPayload(product, variant) {
  var variantObj = {};

  variantObj.name = getVariantName(product, variant);
  variantObj.barcode = !empty(variant.getUPC()) ? variant.getUPC() : variant.getEAN();
  variantObj.sku = getSKU(variant);
  var price = variant.priceModel.price.available && variant.priceModel.price.value > 0 ? variant.priceModel.price.value : 0;
  variantObj.price = price;
  variantObj.external_id = variant.getID();

  return variantObj;
}

function getSKU(variant) {
  return variant.getID();
}

function getVariantName(product, variant) {
  if (variant.isVariant()) {
    var variationModel = variant.getVariationModel();
    var variationAttributes = variationModel.getProductVariationAttributes();
    var names = [];
    variationAttributes.toArray().forEach(function (variationAttribute) {
      names.push(variationModel.getSelectedValue(variationAttribute).displayValue);
    });
    return names.join(' / ');
  } else {
    return variant.getName() == product.getName() ? '' : variant.getName();
  }
}

function getFullName(variant) {
  if (variant.isMaster()) {
    return variant.getName();
  } else {
    var variantName = getVariantName(variant);
    var product = variant.getMasterProduct();
    return product.getName + ' (' + variantName + ')';
  }
}

module.exports = {
  buildVariantPayload: buildVariantPayload
};