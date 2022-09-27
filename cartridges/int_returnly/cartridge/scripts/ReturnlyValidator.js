const Site = require("dw/system/Site");

const ReturnlyExceptions = require("~/cartridge/scripts/ReturnlyExceptions");

const SITE_CURRENCY = Site.getCurrent().getDefaultCurrency();

function isValidAddress(address) {
  return (
    !empty(address) &&
    !empty(address.full_name) &&
    !empty(address.address) &&
    !empty(address.address.country_code) &&
    !empty(address.address.postal_code) &&
    !empty(address.address.city) &&
    !empty(address.address.line1)
  );
}

function validateBillingAddress(params) {
  if (!isValidAddress(params.billing_address)) {
    throw new ReturnlyExceptions.InvalidBillingAddress(
      "Invalid billing address"
    );
  }
}

function validateShippingAddress(params) {
  if (!isValidAddress(params.shipping_address)) {
    throw new ReturnlyExceptions.InvalidShippingAddress(
      "Invalid shipping address"
    );
  }
}

function validateShipping(params) {
  if (!empty(params.shipping_amount) && isNaN(params.shipping_amount)) {
    throw new ReturnlyExceptions.BadRequest(
      "Invalid payload: shipping_amount " + params.shipping_amount
    );
  }

  if (!empty(params.shipping_tax_amount) && isNaN(params.shipping_tax_amount)) {
    throw new ReturnlyExceptions.BadRequest(
      "Invalid payload: shipping_tax_amount " + params.shipping_tax_amount
    );
  }
}

function validateLineItem(lineItem) {
  if (empty(lineItem.units) || isNaN(lineItem.units)) {
    throw new ReturnlyExceptions.InvalidQuantity("Invalid quanitiy");
  }

  if (lineItem.units <= 0) {
    throw new ReturnlyExceptions.InvalidQuantity("Invalid quanitiy");
  }

  if (empty(lineItem.product_amount) || isNaN(lineItem.product_amount)) {
    throw new ReturnlyExceptions.InvalidProductData(
      "Invalid payload: product_amount: " + lineItem.product_amount
    );
  }

  if (empty(lineItem.tax_amount) || isNaN(lineItem.tax_amount)) {
    throw new ReturnlyExceptions.InvalidProductData(
      "Invalid payload: tax_amount: " + lineItem.tax_amount
    );
  }

  if (!empty(lineItem.tax_amount) && isNaN(lineItem.discount_amount)) {
    throw new ReturnlyExceptions.InvalidProductData(
      "Invalid payload: discount_amount: " + lineItem.discount_amount
    );
  }

  if (empty(lineItem.variant_id)) {
    throw new ReturnlyExceptions.InvalidProductID(
      "Invalid payload: variant_id: " + lineItem.variant_id
    );
  }
}

function validateLineItems(params) {
  params.draft_order_line_items.forEach(validateLineItem);
}

function validateTransaction(transaction) {
  [
    "id",
    "amount",
    "status",
    "type",
    "gateway",
    "is_online",
    "is_test",
    "payment_details",
    "created_at"
  ].forEach(function(attribute) {
    if (empty(transaction[attribute])) {
      throw new ReturnlyExceptions.BadRequest(
        "Invalid payload: " + attribute + " " + transaction[attribute]
      );
    }
  });

  if (isNaN(transaction.amount)) {
    throw new ReturnlyExceptions.BadRequest(
      "Invalid payload: amount" + transaction.amount
    );
  }
}

function validateTransactions(params) {
  params.draft_order_transactions.forEach(validateTransaction);
}

function validateCurrency(params) {
  if (empty(params.currency) || params.currency !== SITE_CURRENCY) {
    throw new ReturnlyExceptions.InvalidCurrencyCode(
      "Invalid payload: currency"
    );
  }
}

function validateDraftOrder(params) {
  validateBillingAddress(params);
  validateShippingAddress(params);
  validateShipping(params);
  validateLineItems(params);
  validateTransactions(params);
  validateCurrency(params);
}

module.exports = {
  validateDraftOrder: validateDraftOrder
};
