'use strict';

var server = require('server');
var page = module.superModule;
var Transaction = require('dw/system/Transaction');

server.extend(page);

server.prepend('Begin', server.middleware.get, function (req, res, next) {
  // let session = req.session;
  // res.json({ status: 'added', session: session });

  var BasketMgr = require('dw/order/BasketMgr');
  var ProductMgr = require('dw/catalog/ProductMgr');
  var currentBasket = BasketMgr.getCurrentBasket();
  var totalPrice = currentBasket.merchandizeTotalGrossPrice.value;
  var cartHelper = require('*/cartridge/scripts/cart/cartHelpers');
  var shippedLi;
  var product = ProductMgr.getProduct('shipped-shield');


  // remove any existing items first
  var existingLineItems = currentBasket.getAllProductLineItems();
  for each (var lineItem in existingLineItems.toArray()) {
    if (lineItem.productID === 'shipped-shield') {
      Transaction.wrap(function () {
        currentBasket.removeProductLineItem(lineItem);
      });
    }
  }

  // add relevant items
  var optionModel = product.getOptionModel();
  var productOption = optionModel.options[0];
  optionModel.setSelectedOptionValue(productOption, productOption.optionValues[1])

  Transaction.wrap(function () {
    shippedLi = cartHelper.addLineItem(
      currentBasket,
      product,
      1,
      [],
      optionModel,
      currentBasket.getDefaultShipment()
    );
  });


  // if (true) { // should add or remove shipped?
  //   res.json({
  //     status: 'added', grossPrice: shippedLi.grossPrice.value, price: shippedLi.price.value, quantity: shippedLi.quantity.value
  //   });
  // }
  next();
});

module.exports = server.exports();
