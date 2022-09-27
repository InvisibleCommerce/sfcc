const OrderMgr = require("dw/order/OrderMgr");
const Order = require("dw/order/Order");
const BasketMgr = require("dw/order/BasketMgr");
const ShippingMgr = require("dw/order/ShippingMgr");
const Transaction = require("dw/system/Transaction");
const ProductMgr = require("dw/catalog/ProductMgr");
const AgentUserMgr = require("dw/customer/AgentUserMgr");
const CustomerMgr = require("dw/customer/CustomerMgr");
const Status = require("dw/system/Status");
const Site = require("dw/system/Site");
const Decimal = require("dw/util/Decimal");
const Money = require("dw/value/Money");
const GiftCertificateMgr = require("dw/order/GiftCertificateMgr");
const PaymentMgr = require("dw/order/PaymentMgr");
const PaymentTransaction = require("dw/order/PaymentTransaction");

const ReturnlyExceptions = require("~/cartridge/scripts/ReturnlyExceptions");
const LibReturnly = require("~/cartridge/scripts/libReturnly");
const ReturnlyValidator = require("~/cartridge/scripts/ReturnlyValidator");

const SITE_CURRENCY = Site.getCurrent().getDefaultCurrency();
const SITE_NAME = Site.getCurrent().name;

function createBillingAddress(basket, billingAddressParams) {
  const billingAddress = basket.createBillingAddress();

  billingAddress.firstName = billingAddressParams.full_name;
  billingAddress.address1 = billingAddressParams.address.line1;
  billingAddress.address2 = billingAddressParams.address.line2;
  billingAddress.city = billingAddressParams.address.city;
  billingAddress.countryCode = billingAddressParams.address.country_code;
  billingAddress.stateCode = billingAddressParams.address.province_code;
  billingAddress.postalCode = billingAddressParams.address.postal_code;
  billingAddress.phone = billingAddressParams.phone;

  return billingAddress;
}

function createShipment(basket, params) {
  const shippingAddressParams = params.shipping_address;
  let amount = new Decimal(0);
  let taxAmount = new Decimal(0);

  if (!empty(params.shipping_amount)) {
    amount = new Decimal(params.shipping_amount);
  }

  if (!empty(params.shipping_tax_amount)) {
    taxAmount = new Decimal(params.shipping_tax_amount);
  }

  const shipment =
    basket.defaultShipment || basket.createShipment(new Date().toISOString());

  const shippingAddress = shipment.createShippingAddress();
  shippingAddress.firstName = shippingAddressParams.full_name;
  shippingAddress.address1 = shippingAddressParams.address.line1;

  if (!empty(shippingAddressParams.address.line2)) {
    shippingAddress.address2 = shippingAddressParams.address.line2;
  }

  shippingAddress.city = shippingAddressParams.address.city;
  shippingAddress.countryCode = shippingAddressParams.address.country_code;
  shippingAddress.stateCode = shippingAddressParams.address.province_code;
  shippingAddress.postalCode = shippingAddressParams.address.postal_code;
  shippingAddress.phone = shippingAddressParams.phone;

  const shippingMethod = ShippingMgr.getDefaultShippingMethod();
  shipment.setShippingMethod(shippingMethod);

  const shippingLineItem = shipment.shippingLineItems.iterator().next();
  shippingLineItem.setPriceValue(amount.get());
  shippingLineItem.updateTaxAmount(new Money(taxAmount.get(), SITE_CURRENCY));

  return shipment;
}

function addLineItems(basket, shipment, lineItemsParams) {
  lineItemsParams.forEach(function(lineItem) {
    const lineItemUnits = parseInt(lineItem.units, 10);
    const lineItemAmount = parseFloat(lineItem.product_amount);
    const lineItemTaxAmount = parseFloat(lineItem.tax_amount);

    const product = ProductMgr.getProduct(lineItem.variant_id);

    if (empty(product)) {
      throw new ReturnlyExceptions.InvalidProductID(
        "Invalid payload: variant_id: " + lineItem.variant_id
      );
    }

    if (!product.availabilityModel.isInStock(lineItemUnits)) {
      throw new ReturnlyExceptions.InsufficientInventory(
        "Insufficient Inventory"
      );
    }

    const productLineItem = basket.createProductLineItem(
      lineItem.variant_id,
      shipment
    );

    productLineItem.setQuantityValue(lineItemUnits);
    productLineItem.setPriceValue(lineItemAmount);
    productLineItem.updateTaxAmount(
      new dw.value.Money(lineItemTaxAmount, SITE_CURRENCY)
    );

    if (!empty(lineItem.discount_amount)) {
      const priceAdjustment = productLineItem.createPriceAdjustment(
        new Date().toISOString()
      );
      priceAdjustment.setPriceValue(parseFloat(lineItem.discount_amount) * -1);
      priceAdjustment.updateTaxAmount(new dw.value.Money(0, SITE_CURRENCY));
    }
  });
}

function loginOnBehalfOfCustomer(customerParams) {
  const config = LibReturnly.getConfig();

  AgentUserMgr.loginAgentUser(
    config.custom.agentUserLogin,
    config.custom.agentUserPassword
  );

  if (!empty(customerParams.id)) {
    customer = CustomerMgr.getCustomerByCustomerNumber(customerParams.id);

    if (empty(customer)) {
      throw new ReturnlyExceptions.NotFound(
        "No such customer with Customer ID = " + customerParams.id
      );
    }
  }

  AgentUserMgr.loginOnBehalfOfCustomer(customer);

  return customer;
}

function createPaymentInstruments(basket, returnlyTransactions) {
  returnlyTransactions.forEach(function(returnlyTransaction) {
    const paymentAmount = new Decimal(returnlyTransaction.amount);
    const giftCertificatePaymentInstrument = basket.createPaymentInstrument(
      "RETURNLY",
      new Money(paymentAmount.get(), SITE_CURRENCY)
    );
    giftCertificatePaymentInstrument.custom.returnlyTransaction = JSON.stringify(
      returnlyTransaction
    );
  });
}

function createAuthPaymentTransactions(order) {
  order.paymentInstruments.toArray().forEach(function(paymentInstrument) {
    const authTransaction = paymentInstrument.paymentTransaction;
    const returnlyTransaction = JSON.parse(
      paymentInstrument.custom.returnlyTransaction
    );
    authTransaction.setTransactionID(returnlyTransaction.id);
    const paymentProcessor = PaymentMgr.getPaymentMethod("RETURNLY")
      .paymentProcessor;
    authTransaction.setPaymentProcessor(paymentProcessor);
    authTransaction.setType(PaymentTransaction.TYPE_AUTH);
  });
}

function displayShippingAddress(order) {
  let address = order.defaultShipment.shippingAddress;
  let addressArray = [address.address1];
  if (!empty(address.address2)) addressArray.push(address.address2);
  addressArray.push(address.city);
  addressArray.push(address.stateCode);
  return addressArray.join(', ') + ' ' + address.postalCode
}

function displayLineItems(order) {
  return order.productLineItems.toArray().map(function(lineItem) {
    return lineItem.product.name;
  }).join(', ');
}

function sendConfirmationEmail(order) {
  const mail = new dw.net.Mail();

  mail.setFrom(
    Site.getCurrent().getCustomPreferenceValue("customerServiceEmail")
  );

  mail.addTo(order.customerEmail);
  mail.setSubject("Your " + SITE_NAME + " exchange order!");

  const template = new dw.util.Template(
    "returnly/exchangeConfirmationEmail.isml"
  );

  const templateParams = new dw.util.HashMap();
  templateParams.put("order", order);
  templateParams.put("shippingAddress", displayShippingAddress(order));
  templateParams.put("lineItems", displayLineItems(order));
  templateParams.put("siteName", SITE_NAME);
  const emailBody = template.render(templateParams);

  mail.setContent(emailBody);
  mail.send();
}

function createDraft(params) {
  ReturnlyValidator.validateDraftOrder(params);

  customer = loginOnBehalfOfCustomer(params.customer);
  let order;

  Transaction.wrap(function() {
    const basket = BasketMgr.createAgentBasket();
    createBillingAddress(basket, params.billing_address);
    const shipment = createShipment(basket, params);
    addLineItems(basket, shipment, params.draft_order_line_items);
    basket.setCustomerEmail(params.customer.email);
    basket.setCustomerName(
      params.customer.first_name + "" + params.customer.last_name
    );
    createPaymentInstruments(basket, params.draft_order_transactions);
    basket.updateTotals();

    if (!empty(params.note)) {
      basket.addNote("", params.note);
    }

    order = OrderMgr.createOrder(basket);
    order.custom.tags = params.tags;
  });

  return order;
}

function cancelDraft(draftID) {
  let status;

  if (empty(draftID)) {
    throw new ReturnlyExceptions.BadRequest("Bad request");
  }

  const order = OrderMgr.getOrder(draftID);

  if (order === null) {
    throw new ReturnlyExceptions.InvalidDraftID("Invalid Draft Order ID");
  }

  Transaction.wrap(function() {
    status = OrderMgr.failOrder(order);
  });

  if (status.status !== Status.OK) {
    throw new ReturnlyExceptions.InvalidDraftID("Invalid Draft Order ID");
  }
}

function completeDraft(draftID) {
  let status;

  if (empty(draftID)) {
    throw new ReturnlyExceptions.BadRequest("Bad request");
  }

  const order = OrderMgr.getOrder(draftID);

  if (order === null) {
    throw new ReturnlyExceptions.InvalidDraftID("Invalid Draft Order ID");
  }

  Transaction.wrap(function() {
    createAuthPaymentTransactions(order);
    status = OrderMgr.placeOrder(order);
    order.setPaymentStatus(Order.PAYMENT_STATUS_PAID);
  });

  if (status.status !== Status.OK) {
    throw new ReturnlyExceptions.InvalidDraftID("Couldn't create an order.");
  }

  sendConfirmationEmail(order);

  return order;
}

module.exports = {
  createDraft: createDraft,
  cancelDraft: cancelDraft,
  completeDraft: completeDraft
};
