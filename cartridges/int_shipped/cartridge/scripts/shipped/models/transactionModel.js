'use strict';

/**
 * Maps to Shipped Suite API transaction category
 * @param {dw.order.PaymentTransaction} paymentTransaction - Payment transaction
 * @returns {String} Shipped Suite API transaction category
 */

function getCategory(paymentTransaction) {
  var category = paymentTransaction.getType().getValue();

  if (empty(category)) return 'sale';

  return category;
}

/**
 * Builds transaction payload for Shipped Suite API
 * @param {dw.order.OrderPaymentInstrument} paymentInstrument - Payment instrument
 * @returns {Object} object containing transaction payload in Shipped Suite API format
 */

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
