'use strict';

var Transaction = require('dw/system/Transaction');
var ProductMgr = require('dw/catalog/ProductMgr');
var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
var webService = require('~/cartridge/scripts/services/shippedRest');
var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');
var Site = require('dw/system/Site').getCurrent();

function ensureCorrectShippedLineItems(lineItemsContainer, shippedSelected) {
  // remove any existing items first
  removeShippedLineItems(lineItemsContainer);
  removeShippedOrderPriceAdjustment(lineItemsContainer);

  // add relevant items
  // addShippedLineItems(currentBasket)
  if (shippedSelected) {
    var shippedLineItemType = Site.getCustomPreferenceValue('shippedLineItemType').value;
    if (shippedLineItemType === 'productPriceAdjustment') {
      addShippedProductPriceAdjustment(lineItemsContainer);
    } else {
      addShippedOrderPriceAdjustment(lineItemsContainer);
    }
  }
}

function calculateTotalPrice(currentBasket) {
  var basketTotal = currentBasket.merchandizeTotalNetPrice.value;

  currentBasket.getAllProductLineItems().toArray().forEach(function (productLineItem) {
    if (productLineItem.getProductID() === 'shipped-shield' || productLineItem.getProductID() === 'shipped-green') {
      basketTotal -= productLineItem.getGrossPrice();
    }
  });

  return basketTotal;
}

function calculateShippedFee(currentBasket) {
  var totalPrice = calculateTotalPrice(currentBasket);
  var response = webService.makeServiceRequest('getOffers', { order_value: totalPrice });
  // TODO: support both green and shield at the same time.

  return parseFloat(response.shield_fee);
}

function removeShippedOrderPriceAdjustment(currentBasket) {
  var existingPriceAdjustment = currentBasket.getPriceAdjustmentByPromotionID('shipped-shield');
  if (empty(existingPriceAdjustment)) return;

  Transaction.wrap(function () {
    currentBasket.removePriceAdjustment(existingPriceAdjustment);
  });
}

function addShippedOrderPriceAdjustment(currentBasket) {
  var orderPriceAdjustment;
  Transaction.wrap(function () {
    orderPriceAdjustment = currentBasket.createPriceAdjustment('shipped-shield');
    logger.info(orderPriceAdjustment)
    orderPriceAdjustment.setPriceValue(calculateShippedFee(currentBasket));
    orderPriceAdjustment.setLineItemText('Shipped Shield');
  });
}

function removeShippedLineItems(currentBasket) {
  var product = ProductMgr.getProduct('shipped-shield');

  var existingLineItems = currentBasket.getAllProductLineItems();
  existingLineItems.toArray().forEach(function (lineItem) {
    if (lineItem.productID === product.getID()) {
      Transaction.wrap(function () {
        currentBasket.removeProductLineItem(lineItem);
      });
    }
  });
}

function addShippedProductPriceAdjustment(currentBasket) {
  var product = ProductMgr.getProduct('shipped-shield');
  var optionModel = product.getOptionModel();
  var productLineItem;
  var fee = calculateShippedFee(currentBasket);
  if (fee <= 0) return;

  Transaction.wrap(function () {
    productLineItem = cartHelper.addLineItem(
      currentBasket,
      product,
      1,
      [],
      optionModel,
      currentBasket.getDefaultShipment()
    );
    var priceAdjustment = productLineItem.createPriceAdjustment('shipped-shield');
    priceAdjustment.setPriceValue(fee);
  });
}

// function addShippedLineItems(currentBasket) {
//   var product = ProductMgr.getProduct('shipped-shield');
//
//   var optionModel = product.getOptionModel();
//   var productOption = optionModel.options[0];
//   optionModel.setSelectedOptionValue(productOption, productOption.optionValues[0])
//
//   Transaction.wrap(function () {
//     cartHelper.addLineItem(
//       currentBasket,
//       product,
//       1,
//       [],
//       optionModel,
//       currentBasket.getDefaultShipment()
//     );
//   });
// }

module.exports = {
  ensureCorrectShippedLineItems: ensureCorrectShippedLineItems
};
