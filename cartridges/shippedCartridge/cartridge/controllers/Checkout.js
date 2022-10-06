'use strict';

var server = require('server');
var page = module.superModule;
var Transaction = require('dw/system/Transaction');
var ProductMgr = require('dw/catalog/ProductMgr');
var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');
var webService = require('~/cartridge/scripts/services/rest');

server.extend(page);

// server.replace('Begin', function (req, res, next) {
//   res.json({ status: 'added', session: req.session.privacyCache.get('shippedSuite') });
//   next();
// });

server.prepend('Begin', function (req, res, next) {
  var BasketMgr = require('dw/order/BasketMgr');
  var currentBasket = BasketMgr.getCurrentBasket();

  // remove any existing items first
  // removeShippedLineItems(currentBasket);
  removeShippedOrderPriceAdjustment(currentBasket)

  // add relevant items
  // addShippedLineItems(currentBasket)
  // addShippedProductPriceAdjustment(currentBasket);
  addShippedOrderPriceAdjustment(currentBasket);

  next();
});

function calculateTotalPrice(currentBasket) {
  return currentBasket.merchandizeTotalNetPrice.value;
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
  for each (var lineItem in existingLineItems.toArray()) {
    if (lineItem.productID === product.getID()) {
      Transaction.wrap(function () {
        currentBasket.removeProductLineItem(lineItem);
      });
    }
  }
}

function addShippedProductPriceAdjustment(currentBasket) {
  var product = ProductMgr.getProduct('shipped-shield');
  var optionModel = product.getOptionModel();
  var productLineItem;
  var fee = calculateShippedFee(currentBasket);

  Transaction.wrap(function () {
    productLineItem = cartHelper.addLineItem(
      currentBasket,
      product,
      1,
      [],
      optionModel,
      currentBasket.getDefaultShipment()
    );
    var priceAdjustment = productLineItem.createPriceAdjustment('shipped-shield')
    priceAdjustment.setPriceValue(fee);
  });
}

function addShippedLineItems(currentBasket) {
  var product = ProductMgr.getProduct('shipped-shield');

  var optionModel = product.getOptionModel();
  var productOption = optionModel.options[0];
  optionModel.setSelectedOptionValue(productOption, productOption.optionValues[0])

  Transaction.wrap(function () {
    cartHelper.addLineItem(
      currentBasket,
      product,
      1,
      [],
      optionModel,
      currentBasket.getDefaultShipment()
    );
  });
}

module.exports = server.exports();
