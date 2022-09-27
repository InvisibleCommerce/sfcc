function BadRequest(message, status) {
  this.message = message;
  this.status = status || 400;
  this.name = "unprocessable.bad_request";
}

function InvalidDraftID(message, status) {
  this.message = message;
  this.status = status || 400;
  this.name = "unprocessable.invalid_draft_id";
}

function NotFound(message, status) {
  this.message = message;
  this.status = status || 404;
  this.name = "unprocessable.not_found";
}

function InsufficientInventory(message, status) {
  this.message = message;
  this.status = status || 400;
  this.name = "unprocessable.insufficient_inventory";
}

function InvalidProductID(message, status) {
  this.message = message;
  this.status = status || 400;
  this.name = "unprocessable.invalid_product_id";
}

function InvalidProductData(message, status) {
  this.message = message;
  this.status = status || 400;
  this.name = "unprocessable.invalid_product_data";
}

function InvalidCurrencyCode(message, status) {
  this.message = message;
  this.status = status || 400;
  this.name = "unprocessable.invalid_currency_code";
}

function InvalidQuantity(message, status) {
  this.message = message;
  this.status = status || 400;
  this.name = "unprocessable.invalid_quantity";
}

function InvalidShippingAddress(message, status) {
  this.message = message;
  this.status = status || 400;
  this.name = "unprocessable.invalid_shipping_address";
}

function InvalidBillingAddress(message, status) {
  this.message = message;
  this.status = status || 400;
  this.name = "unprocessable.invalid_billing_address";
}

function Unauthorized(message) {
  this.message = message;
  this.status = 401;
  this.name = "unauthorized.bad_credentials";
}

module.exports = {
  BadRequest: BadRequest,
  InvalidDraftID: InvalidDraftID,
  NotFound: NotFound,
  InsufficientInventory: InsufficientInventory,
  InvalidProductID: InvalidProductID,
  InvalidProductData: InvalidProductData,
  InvalidCurrencyCode: InvalidCurrencyCode,
  InvalidQuantity: InvalidQuantity,
  InvalidBillingAddress: InvalidBillingAddress,
  InvalidShippingAddress: InvalidShippingAddress,
  Unauthorized: Unauthorized
};
