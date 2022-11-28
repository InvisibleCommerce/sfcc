'use strict';

var existingDetails;

/**
 * @description Parses out the subtotal number from a subtotal string
 * @param {string} subtotal The subtotal string
 * @returns {number}
 */

function subtotalValue(subtotal) {
  if (subtotal === null || subtotal === undefined) return 0;

  return parseFloat(subtotal.replace('$', '').replace(',', ''));
}

/**
 * shouldRefreshUI callback function containing logic to determine
 * whether the UI needs to be refreshed
 * @callback shouldRefreshUI
 * @param {object} existingDetails Existing/previous response object from Shipped Suite Offers API
 * @param {object} details Latest response objects from Shipped Suite Offers API
 * @param {HTMLElement} widget The <div> node for the Shipped Widget
 * @returns {boolean}
 */

/**
 * refreshUI callback function to execute UI refresh
 * @callback refreshUI
 * @param {object} data Contains the latest cart object
 */

/**
 * @description Callback handler for Shipped widget - calls further handlers for UI refresh logic
 * @param widget {HTMLElement} The <div> node for the Shipped Widget
 * @param details {object} Response object from Shipped Suite Offers API
 * @param shouldRefreshUI {shouldRefreshUI}
 * @param refreshUI {refreshUI}
 */

function handleShippedChange(widget, details, shouldRefreshUI, refreshUI) {
  let path;
  if (details.isSelected) {
    // add shield
    path = widget.dataset.addUrl;
  } else {
    // remove shield
    path = widget.dataset.removeUrl;
  }

  var shouldRefresh = shouldRefreshUI(existingDetails, details, widget);
  existingDetails = details;

  fetch(path, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    mode: 'same-origin',
  }).then(function(response) {
    return response.json();
  }).then(function(data) {
    if (shouldRefresh) {
      refreshUI(data);
    }
  });
}

/**
 * @description Initializes the Shipped Widget
 * @param shouldRefreshUI {shouldRefreshUI}
 * @param refreshUI {refreshUI}
 */

function initializeWidget(shouldRefreshUI, refreshUI) {
  const shippedWidget = new Shipped.Widget(shippedConfig);

  var widget = document.getElementsByClassName('shipped-widget')[0];
  var currency = widget.dataset.currency;
  shippedWidget.updateOrderValue(subtotalValue(widget.dataset.subtotal), currency);
  shippedWidget.onChange(details => handleShippedChange(widget, details, shouldRefreshUI, refreshUI));

  return shippedWidget
}

module.exports = {
  subtotalValue: subtotalValue,
  initializeWidget: initializeWidget
}
