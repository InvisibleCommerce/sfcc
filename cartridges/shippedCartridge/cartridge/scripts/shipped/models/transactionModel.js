'use strict';

var logger = require('dw/system/Logger').getLogger('Shipped', 'Shipped');

function getCategory(paymentTransaction) {
  var category = paymentTransaction.getType().getValue();

  if (empty(category)) return 'sale';

  return category;
}

function buildTransactionPayload(paymentInstrument) {
  var transactionObj = {};
  var paymentTransaction = paymentInstrument.getPaymentTransaction();

  transactionObj.external_id = paymentTransaction.getUUID();
  transactionObj.gateway = paymentTransaction.getPaymentProcessor().getID();
  transactionObj.gateway_id = paymentTransaction.getTransactionID();
  transactionObj.category = getCategory(paymentTransaction);
  transactionObj.currency = paymentTransaction.getAmount().getCurrencyCode();
  transactionObj.amount = paymentTransaction.getAmount().getValue();
  transactionObj.status = 'success';
  transactionObj.processed_at = paymentTransaction.getCreationDate().toISOString();

  return transactionObj;
}

module.exports = {
  buildTransactionPayload: buildTransactionPayload
};
