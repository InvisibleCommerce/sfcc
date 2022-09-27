'use strict'

/**
 * Controller : returnly
 *
 * @module controllers/Returnly
 */

/* API includes */
var ISML = require('dw/template/ISML');
var URLUtils = require('dw/web/URLUtils');
var System = require('dw/system/System');
var Site = require('dw/system/Site');
var Transaction = require('dw/system/Transaction');
var Resource = require('dw/web/Resource');
var libReturnly = require('int_returnly/cartridge/scripts/libReturnly');
var SFTPService, HTTPService;

var r = request.httpParameterMap;
var formFields = {
    APIToken: '',
    APIUsername: '',
    SiteProtectionPassword: '',
    agentUserLogin: '',
    agentUserPassword: '',
    imageViewType: ''
};

/**
 * @description Renders the account overview.
 * @return {void}
 */

function show() {
	var error;

    try {
    	var config = libReturnly.getConfig();

        if(config) {
            fillForm(config);
        }
    } catch (e) {
         error = getErrorMessage(e);
    }

    ISML.renderTemplate('index', {
        configurationContinueUrl: URLUtils.https('Returnly-HandleForm'),
        form: formFields,
        error: error,
        success: null
    })
}

/**
 * @description Updates or create the config for Returnly auth.
 * @return {void}
 */

function handleForm() {
    var error = saveForm();
    if(!error) {
    	try {

            SFTPService = require('~/cartridge/scripts/ReturnlySFTPService');
            HTTPService = require('~/cartridge/scripts/ReturnlyHTTPService');

    		if(!validateSftp() || !registerSite()) {
    			throw new Error('Auth Error');
    		}

        } catch (e) {
        	error = getErrorMessage(e);
        }
    }

    ISML.renderTemplate('index', {
        configurationContinueUrl: URLUtils.https('Returnly-HandleForm'),
        form: fillForm({}),
        error: error,
        success: !error ? Resource.msg('message.successful.auth','returnly',null) : null
    });
}

/**
 * @description Save any valid data to the Custom Object for valid 3th party validation
 * @returns {void/String}
 */
function saveForm() {
  var config;
  try {
    config = libReturnly.getConfig();

    Transaction.begin();

    if(!config) {
      config = libReturnly.createConfig();
    }

    config.custom.APIToken = r.APIToken.value;
    config.custom.SFTPUsername = r.SFTPUsername.value;
    config.custom.SiteProtectionPassword = r.SiteProtectionPassword.value;
    config.custom.agentUserLogin = r.agentUserLogin.value;
    config.custom.agentUserPassword = r.agentUserPassword.value;
    config.custom.imageViewType = r.imageViewType.value;

    Transaction.commit();
  } catch(e) {
    Transaction.rollback();
    return getErrorMessage(e);
  }
}

/**
 * @description Return user friendly error message
 * @param exception {Object}
 * @returns {String}
 */

function getErrorMessage(exception) {
	switch (exception.javaMessage || exception.message) {
	case "Type does not exist: Returnly":
		return Resource.msg('error.customObjectsError','returnly',null);
	case "Service not found":
		return Resource.msg('error.servicesError','returnly',null);
	case "Auth Error":
		return Resource.msg('error.authError','returnly',null);
    case "SSL Error":
        return Resource.msg('error.sslError','returnly',null);
	default:
		return Resource.msg('error.unhandledError','returnly',null);
	}
}

/**
 * @description Pre-fill form data from the CustomObject
 * @param data Object
 * @returns {{APIToken: (*|string), SFTPUsername: (*|string), SiteProtectionPassword: (*|string)}}
 */

function fillForm(data) {
    var storeFrontPassword = data.custom ? data.custom.SiteProtectionPassword : r.SiteProtectionPassword.value;

    return formFields = {
        APIToken: r.APIToken.value || data.custom.APIToken,
        SFTPUsername: r.SFTPUsername.value || data.custom.SFTPUsername,
        SiteProtectionPassword: storeFrontPassword,
        agentUserLogin: r.agentUserLogin.value || data.custom.agentUserLogin,
        agentUserPassword: r.agentUserPassword.value || data.custom.agentUserPassword,
        imageViewType: r.imageViewType.value || data.custom.imageViewType
    }
}

/**
 * @description Try to connect to the Returnly SFTP endpoint,
 *              using provided username
 *              return false if username is incorrect
 * @returns {Boolean}
 */
function validateSftp() {
    var response = SFTPService
        .call({ username: r.SFTPUsername.value });

    return response.object.connected;
}

/**
 * @description Register current Site in the Returnly
 * @returns {Boolean}
 */
function registerSite() {
    var response = HTTPService.call({
                    token: r.APIToken.value,
                    username: r.SFTPUsername.value,
                    storefrontPassword: r.SiteProtectionPassword.value
                });

    var errors = JSON.parse(response.object).errors || [];
    return response.ok && errors.length === 0;
}

exports.Show = show;
exports.Show.public = true;

exports.HandleForm = handleForm;
exports.HandleForm.public = true;
