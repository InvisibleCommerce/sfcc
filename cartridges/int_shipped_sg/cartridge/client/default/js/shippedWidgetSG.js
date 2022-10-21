'use strict';

var shippedWidgetHelpers = require('../../../../../int_shipped/cartridge/client/js/shippedWidgetHelpers');

document.addEventListener('DOMContentLoaded', function () {
  const shippedWidget = shippedWidgetHelpers.initializeWidget(shouldRefreshUI, refreshUI);
  const cartPath = document.getElementsByClassName('shipped-widget')[0].dataset.cartPath;

  function currentFee(widget) {
    return shippedWidgetHelpers.subtotalValue(widget.dataset.currentFee)
  }

  function currentlySelected(widget) {
    return shippedWidgetHelpers.subtotalValue(widget.dataset.currentFee) !== 0;
  }

  function shouldRefreshUI(existingDetails, details, widget) {
    if (widget.dataset.currentFee == 'false') return false;
    if (currentlySelected(widget) !== details.isSelected) return true;
    if (details.isSelected && (currentFee(widget) !== shippedWidgetHelpers.subtotalValue(details.totalFee))) return true;

    return false;
  }

  function refreshUI(data) {
    // don't reload on checkout page to prevent filled in info from being reset.
    if (window.location.toString().includes(cartPath)) window.location.reload();
  }
});
