const Shipment = require("dw/order/Shipment");
const PaymentTransaction = require("dw/order/PaymentTransaction");
const Returnly = require('int_returnly/cartridge/scripts/libReturnly');
const ReturnlyConfig = Returnly.getConfig();

const FULFILLMENT_STATUSES = {};
FULFILLMENT_STATUSES[Shipment.SHIPPING_STATUS_NOTSHIPPED] = "PROCESSING";
FULFILLMENT_STATUSES[Shipment.SHIPPING_STATUS_SHIPPED] = "SUCCESS";

const TRANSACTION_TYPES = {};
TRANSACTION_TYPES[PaymentTransaction.TYPE_AUTH] = "AUTHORIZATION";
TRANSACTION_TYPES[PaymentTransaction.TYPE_CAPTURE] = "CAPTURE";

const IMAGE_VIEW_TYPE = ReturnlyConfig.custom.imageViewType || 'medium';

function stripNulls(key, value) {
  if (value === null || value === "undefined") {
    return undefined;
  }
  return value;
}

function serializeAddress(address) {
  return {
    full_name: address.fullName,
    address: {
      country_code: address.countryCode.value,
      postal_code: address.postalCode,
      province: address.stateCode,
      province_code: address.stateCode,
      city: address.city,
      line1: address.address1,
      line2: address.address2
    },
    phone: address.phone
  };
}

function serializeCustomer(order) {
  return {
    id: order.customerNo,
    first_name: order.customerName,
    email: order.customerEmail
  };
}

function serializeLineItems(lineItems) {
  return lineItems.map(function(lineItem) {
    return {
      id: lineItem.UUID,
      product_id: lineItem.productID,
      variant_id: lineItem.productID,
      title: lineItem.lineItemText,
      sku: lineItem.product.UPC,
      units: lineItem.quantityValue,
      tags: [],
      product_amount: lineItem.netPrice.toNumberString(),
      tax_amount: lineItem.tax.toNumberString(),
      discount_amount: lineItem.netPrice
        .subtract(lineItem.adjustedPrice)
        .toNumberString(),
      unit_price_amount: lineItem.netPrice
        .divide(lineItem.quantityValue)
        .toNumberString()
    };
  });
}

function serializeDraftLineItems(lineItems) {
  return lineItems.map(function(lineItem) {
    return {
      product_id: lineItem.productID,
      variant_id: lineItem.productID,
      units: lineItem.quantityValue,
      product_amount: lineItem.netPrice.toNumberString(),
      tax_amount: lineItem.tax.toNumberString(),
      discount_amount: lineItem.netPrice
        .subtract(lineItem.adjustedPrice)
        .toNumberString()
    };
  });
}

function serializeDiscounts(order) {
  return order.priceAdjustments.toArray().map(function(discount) {
    return {
      id: discount.UUID,
      code: discount.couponLineItem.couponCode,
      created_at: discount.getCreationDate().toISOString(),
      updated_at: discount.getLastModified().toISOString()
    };
  });
}

function serializePaymentInstruments(order) {
  return order.paymentInstruments.toArray().map(function(paymentInstrument) {
    return JSON.parse(paymentInstrument.custom.returnlyTransaction);
  });
}

function serializePaymentTransactions(order) {
  return order.paymentInstruments.toArray().map(function(paymentInstrument) {
    const returnlyTransaction = JSON.parse(
      paymentInstrument.custom.returnlyTransaction
    );
    return {
      id: paymentInstrument.paymentTransaction.transactionID,
      amount: paymentInstrument.paymentTransaction.amount.toNumberString(),
      status: "SUCCESS",
      type: TRANSACTION_TYPES[paymentInstrument.paymentTransaction.type],
      gateway: returnlyTransaction.gateway,
      is_online: returnlyTransaction.is_online,
      is_test: returnlyTransaction.is_test,
      payment_details: returnlyTransaction.payment_details,
      created_at: paymentInstrument.getLastModified().toISOString(),
      updated_at: paymentInstrument.getLastModified().toISOString()
    };
  });
}

function orderToJSON(order) {
  const orderJSON = {
    id: order.orderNo,
    raw_status: order.status.displayValue,
    status: "AUTHORIZED",
    product_amount: order.getTotalNetPrice().toNumberString(),
    tax_amount: order.getMerchandizeTotalTax().toNumberString(),
    discount_amount: order
      .getTotalNetPrice()
      .subtract(order.getAdjustedMerchandizeTotalNetPrice())
      .toNumberString(),
    shipping_amount: order.getShippingTotalNetPrice().toNumberString(),
    shipping_tax_amount: order.getShippingTotalTax().toNumberString(),
    customer: serializeCustomer(order),
    shipping_address: serializeAddress(order.defaultShipment.shippingAddress),
    billing_address: serializeAddress(order.billingAddress),
    order_line_items: serializeLineItems(order.productLineItems.toArray()),
    order_fulfillments: [],
    order_transactions: serializePaymentTransactions(order),
    order_refunds: [],
    order_discounts: serializeDiscounts(order),
    tags: order.custom.tags.map(function(tag) {
      return tag;
    }),
    note: (order.notes.size() > 0 && order.notes.get(0).text) || null,
    created_at: order.getCreationDate().toISOString(),
    updated_at: order.getLastModified().toISOString(),
    currency: order.currencyCode
  };

  return JSON.stringify(orderJSON, stripNulls);
}

function draftToJSON(order) {
  const orderJSON = {
    draft_order_id: order.orderNo,
    draft_order: {
      customer: serializeCustomer(order),
      shipping_address: serializeAddress(order.defaultShipment.shippingAddress),
      billing_address: serializeAddress(order.billingAddress),
      draft_order_line_items: serializeDraftLineItems(
        order.productLineItems.toArray()
      ),
      send_receipt: false,
      shipping_amount: order.getShippingTotalNetPrice().toNumberString(),
      shipping_tax_amount: order.getShippingTotalTax().toNumberString(),
      tags: order.custom.tags.map(function(tag) {
        return tag;
      }),
      note: (order.notes.size() > 0 && order.notes.get(0).text) || null,
      draft_order_transactions: serializePaymentInstruments(order),
      currency: order.currencyCode
    }
  };

  return JSON.stringify(orderJSON, stripNulls);
}

function errorToJSON(error) {
  const errorJSON = {
    errors: [
      {
        code: error.name,
        message: error.message,
        details: error.stack,
        service: "demandware.extension"
      }
    ]
  };

  return JSON.stringify(errorJSON, stripNulls);
}

function serializeVariants(product) {
  const variants = product.variationModel.variants;
  return variants.toArray().map(function(variant) {
    const image =
      (!empty(variant.getImage(IMAGE_VIEW_TYPE)) &&
        variant.getImage(IMAGE_VIEW_TYPE).httpsURL.toString()) ||
      null;
    const inventoryData = getInventoryData(variant);
    return {
      attributes: variant.variationModel.productVariationAttributes
        .toArray()
        .map(function(variationAttribute) {
          return {
            name: variationAttribute.displayName,
            value: variant.variationModel.getSelectedValue(variationAttribute)
              .displayValue
          };
        }),
      allow_backorder: inventoryData.backorderable,
      product_id: product.ID,
      variant_id: variant.ID,
      product_amount: variant.priceModel.price.toNumberString(),
      quantity_in_stock: inventoryData.quantityInStock,
      inventory_managed_by_platform: true,
      sku: variant.UPC,
      title: variant.name,
      image_urls: (!empty(image) && [image]) || []
    };
  });
}

function getInventoryData(variant) {
  const inventoryRecord = variant.availabilityModel.inventoryRecord;
  if (!inventoryRecord) {
    return {
      backorderable: null,
      quantityInStock: 0
    }
  }

  return {
    backorderable: inventoryRecord.backorderable,
    quantityInStock: inventoryRecord.ATS.value
  }
}

function productToJSON(product) {
  const productJSON = {
    attribute_definitions: product.variationModel.productVariationAttributes
      .toArray()
      .map(function(variationAttribute) {
        return {
          name: variationAttribute.displayName,
          values: product.variationModel
            .getAllValues(variationAttribute)
            .toArray()
            .map(function(variationValue) {
              return variationValue.displayValue;
            })
        };
      }),
    product_id: product.ID,
    tags: [],
    title: product.name,
    variants: serializeVariants(product)
  };

  return JSON.stringify(productJSON, stripNulls);
}

module.exports = {
  orderToJSON: orderToJSON,
  draftToJSON: draftToJSON,
  errorToJSON: errorToJSON,
  productToJSON: productToJSON
};
