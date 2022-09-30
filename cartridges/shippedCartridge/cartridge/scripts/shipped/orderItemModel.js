'use strict';

var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');

function buildOrderItemPayload(productLineItem) {
  var orderItemObj = {};
  var product = productLineItem.getProduct();
  logger.info(JSON.stringify(productLineItem));

  orderItemObj.external_id = productLineItem.getUUID();
  orderItemObj.external_product_id = getProductID(product);
  orderItemObj.external_variant_id = getVariantID(product);
  orderItemObj.sku = product.getID();
  orderItemObj.description = productLineItem.getLineItemText();
  orderItemObj.quantity = productLineItem.getQuantityValue();
  orderItemObj.unit_price = getUnitPrice(productLineItem);
  orderItemObj.discount = 0;
  orderItemObj.tax = getTax(productLineItem);
  orderItemObj.product_type = getProductType(product);

  logger.info(JSON.stringify(orderItemObj));

  return orderItemObj;
}

function getTax(productLineItem) {
  if (empty(productLineItem.getAdjustedTax())) return 0;

  return productLineItem.getAdjustedTax().getDecimalValue().toString();
}

function getUnitPrice(productLineItem) {
  var netPrice = getTotalPrice(productLineItem);

  return netPrice / productLineItem.getQuantityValue();
}

function getTotalPrice(productLineItem) {
  var options = productLineItem.getOptionProductLineItems();
  var productPrice = productLineItem.getAdjustedNetPrice().getValue();

  if (empty(options)) return productPrice;

  var optionsPrice = 0;
  for each (var option in options) {
    optionsPrice += option.getAdjustedNetPrice().getValue();
  }

  return productPrice + optionsPrice;
}

function getProductID(product) {
  if (product.isVariant()) {
    return product.getMasterProduct().getID();
  }

  return product.getID();
}

function getVariantID(product) {
  return product.getID();
}

function getProductType(product) {
  if (product.getID().includes('shipped-shield')) {
    return 'insurance';
  }

  if (product.getID().includes('shipped-green')) {
    return 'carbon';
  }

  return 'regular';
}

function isShield(productLineItem) {
  var product = productLineItem.getProduct()
  if (empty(product)) return;

  return getProductType(product) == 'insurance';
}

function isGreen(productLineItem) {
  var product = productLineItem.getProduct()
  if (empty(product)) return;

  return getProductType(product) == 'carbon';
}

module.exports = {
  buildOrderItemPayload: buildOrderItemPayload,
  isShield: isShield,
  isGreen: isGreen
};
