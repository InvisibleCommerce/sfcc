'use strict';

/**
 * Gets tax amount for product line item
 * @param {dw.order.ProductLineItem} productLineItem - Product line item
 * @returns {String} decimal value of tax amount
 */

function getTax(productLineItem) {
  if (empty(productLineItem.getAdjustedTax())) return 0;

  return productLineItem.getAdjustedTax().getDecimalValue().toString();
}

/**
 * Gets total price for product line item
 * @param {dw.order.ProductLineItem} productLineItem - Product line item
 * @returns {Number} decimal value of total price
 */

function getTotalPrice(productLineItem) {
  var options = productLineItem.getOptionProductLineItems();
  var productPrice = productLineItem.getAdjustedNetPrice().getValue();

  if (empty(options)) return productPrice;

  var optionsPrice = 0;
  options.toArray().forEach(function (option) {
    optionsPrice += option.getAdjustedNetPrice().getValue();
  });

  return productPrice + optionsPrice;
}

/**
 * Gets unit price for product line item
 * @param {dw.order.ProductLineItem} productLineItem - Product line item
 * @returns {Number} decimal value of unit price
 */

function getUnitPrice(productLineItem) {
  var netPrice = getTotalPrice(productLineItem);

  return netPrice / productLineItem.getQuantityValue();
}

/**
 * Gets ultimate parent product ID for product
 * @param {dw.catalog.Product} product - Product
 * @returns {String} product ID
 */

function getProductID(product) {
  if (product.isVariant()) {
    return product.getMasterProduct().getID();
  }

  return product.getID();
}

/**
 * Gets ID for product
 * @param {dw.catalog.Product} product - Product
 * @returns {String} product ID
 */

function getVariantID(product) {
  return product.getID();
}

/**
 * Builds order item payload for Shipped Suite API
 * @param {dw.order.ProductLineItem} productLineItem - Product line item
 * @returns {Object} object containing order item payload in Shipped Suite API format
 */

function buildOrderItemPayload(productLineItem) {
  var orderItemObj = {};
  var product = productLineItem.getProduct();

  orderItemObj.external_id = productLineItem.getUUID();
  orderItemObj.external_product_id = getProductID(product);
  orderItemObj.external_variant_id = getVariantID(product);
  orderItemObj.sku = product.getID();
  orderItemObj.description = productLineItem.getLineItemText();
  orderItemObj.quantity = productLineItem.getQuantityValue();
  orderItemObj.unit_price = getUnitPrice(productLineItem);
  orderItemObj.discount = 0;
  orderItemObj.tax = getTax(productLineItem);
  orderItemObj.product_type = 'regular';

  return orderItemObj;
}

module.exports = {
  buildOrderItemPayload: buildOrderItemPayload
};
