'use strict';

/**
 * Determines ID for variant
 * @param {dw.catalog.Variant} variant - Variant
 * @returns {String} variant ID
 */

function getSKU(variant) {
  return variant.getID();
}

/**
 * Determines correct name for a variant
 * @param {dw.catalog.Product} product - Product
 * @param {dw.catalog.Variant} variant - Variant
 * @returns {String} correct variant name
 */

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

/**
 * Builds variant payload for Shipped Suite API
 * @param {dw.catalog.Product} product - Product
 * @param {dw.catalog.Variant} variant - Variant
 * @returns {Object} object containing variant payload in Shipped Suite API format
 */

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

module.exports = {
  buildVariantPayload: buildVariantPayload
};
