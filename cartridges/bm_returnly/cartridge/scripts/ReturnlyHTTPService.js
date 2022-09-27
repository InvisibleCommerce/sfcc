"use strict";

const CONST = require('int_returnly/cartridge/scripts/returnlyConstants');

var ServiceRegistry = require('dw/svc/ServiceRegistry'),
    System = require('dw/system/System'),
    Site = require('dw/system/Site'),
    StringUtils = require('dw/util/StringUtils'),
    HTTPService = function () {};

HTTPService.prototype =  {
    service: ServiceRegistry.get('bm_returnly.http.auth'),
    call: function (options) {
        var auth = StringUtils.encodeBase64(options.username+":"+options.token);

        this.service.URL = CONST.INSTANCE_ENDPOINTS[System.instanceType];

        return this.service.call({
            'auth': auth,
            'sitegenesisVersion': System.compatibilityMode,
            'currency': Site.current.defaultCurrency,
            'locale': Site.current.defaultLocale,
            'siteHostname': Site.current.httpHostName,
            'ID': Site.current.ID,
            'name': Site.current.name,
            'customerServiceEmail': Site.current.preferences.getCustom()["customerServiceEmail"],
            'creationDate': getUTCISOString(Site.current.preferences.creationDate),
            'lastModified': getUTCISOString(Site.current.preferences.lastModified),
            'timezone': Site.current.timezone,
            'instanceHostname': System.instanceHostname,
            'instanceType': CONST.INSTANCE_TYPES[System.instanceType],
            'storefrontProtectionPassword': options.storefrontPassword
        });
    }
};


/**
 * @description Convert Date to UTS Date string in ISO format
 * @returns {string}
 */

function getUTCISOString(date) {

    function pad(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }

    return date.getUTCFullYear() +
        '-' + pad(date.getUTCMonth() + 1) +
        '-' + pad(date.getUTCDate()) +
        'T' + pad(date.getUTCHours()) +
        ':' + pad(date.getUTCMinutes()) +
        ':' + pad(date.getUTCSeconds()) +
        'Z';
};

module.exports = new HTTPService();