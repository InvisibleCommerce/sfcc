'use strict';

var existingDetails;

function subtotalValue(subtotal) {
  if (subtotal === null || subtotal === undefined) return 0;

  return parseFloat(subtotal.replace('$', '').replace(',', ''));
}

function handleShippedChange(widget, details, shouldRefreshUI, refreshUI) {
  let path;
  if (details.isSelected) {
    // add shield
    path = widget.dataset.addUrl;
    console.log('adding...')
  } else {
    // remove shield
    path = widget.dataset.removeUrl;
    console.log('removing...')
  }

  var shouldRefresh = shouldRefreshUI(existingDetails, details, widget);
  console.log('should refresh UI?', shouldRefresh);
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

function initializeWidget(shouldRefreshUI, refreshUI) {
  const shippedWidget = new Shipped.Widget(shippedConfig);

  var widget = document.getElementsByClassName('shipped-widget')[0];
  shippedWidget.updateOrderValue(subtotalValue(widget.dataset.subtotal));
  shippedWidget.onChange(details => handleShippedChange(widget, details, shouldRefreshUI, refreshUI));

  return shippedWidget
}

module.exports = {
  subtotalValue: subtotalValue,
  initializeWidget: initializeWidget
}
