'use strict';

// API Includes
var ISML = require('dw/template/ISML');
var Site = require('dw/system/Site');

// Library Includes
var Returnly = require("~/cartridge/scripts/libReturnly"),
	ReturnlyError = require("~/cartridge/scripts/ReturnlyError"),
	HttpParameterMap = request.httpParameterMap,
	requestDecodedObject = null;

/**
 * Return paremeter from request, independently of request method.
 * In case of POST method, parameter is expected in the JSON-body 
 * 
 * @param param String name of parameter
 * @returns String
 */
function getParam(param){
	if (request.httpMethod == 'GET'){
		return HttpParameterMap[param].stringValue;
	} else {
		if (!requestDecodedObject){
			parseJSONRequest();
		}
		return (requestDecodedObject && param in requestDecodedObject) ? requestDecodedObject[param] : "";
	}
}

/**
 * Try to parse JSON from POST body
 * 
 * @return Boolean
 */
function parseJSONRequest(){
	if (request.httpMethod == 'POST' && !requestDecodedObject){
		try {
			requestDecodedObject = JSON.parse(HttpParameterMap.getRequestBodyAsString());
			return true;
		}catch(e) {
			require('dw/system/Logger').error('Error parsing request body: ' + HttpParameterMap.getRequestBodyAsString());
			return false;
		}
	}
	return true;
}

/**
 * Wrapper that additionally checks HTTP methods and parameters
 * 
 * @param methods
 * @param parameters
 * @param callback
 */
function guarantor(methods, parameters, callback){
	return function(){
		var resp, i;
		if (!parseJSONRequest()){
			resp = new ReturnlyError('JSON is not valid');
			response.setStatus(400);
		} else if (!Returnly.checkAuthentication(getParam('auth'))){
			resp = new ReturnlyError('Authentication failed');
			response.setStatus(401);
		} else if (methods.indexOf(request.httpMethod) == -1){
			resp = new ReturnlyError('Method ' + request.httpMethod + ' not allowed');
			response.setStatus(405);
		} else if (!empty(parameters)){
			for (i = 0; i < parameters.length; i++){
				var parameter = parameters[i];
				if (getParam(parameter) == ""){
					resp = new ReturnlyError('Missing parameter \'' + parameter + '\'');
					response.setStatus(400);
					break;
				}
			}
		}
		if (!resp){
			resp = callback();
		}
    response.setHttpHeader("Content-Type", "application/json");
    response.getWriter().print(JSON.stringify(resp));
	}
}

// public method for getting certificates
function getGiftCertificate(){
	var code = request.httpParameterMap.giftCertificateCode.stringValue,
		certificateDetails;
	certificateDetails = Returnly.getCertificateByCode(code);
	if (certificateDetails instanceof ReturnlyError){
		response.setStatus(400);
	} else {
		response.setStatus(200);
	}
	return certificateDetails;
}

//public method for creating certificates
function createGiftCertificate(){
	var certificateDetails;
	
	certificateDetails = Returnly.createGiftCertificate({
		balance: getParam('balance'),
		code: getParam('giftCertificateCode'),
		description: getParam('description'),
		recipientEmail: getParam('recipientEmail'),
		recipientName: getParam('recipientName'),
		message: getParam('message'),
		orderNo: getParam('orderNo')
	});
	if (certificateDetails instanceof ReturnlyError){
		response.setStatus(400);
	} else {
		response.setStatus(201);
	}
	
	return certificateDetails;
}

//public method for getting and creating certificates
function disableCertificate(){
	var code = getParam('giftCertificateCode'),
		certificateDetails;
	
	certificateDetails = Returnly.disableGiftCertificateByCode(code);
	if (certificateDetails instanceof ReturnlyError){
		response.setStatus(400);
	} else {
		response.setStatus(200);
	}
	return certificateDetails;
}

//public method for test call
function test(){
	function _getInstanceType(){
		var System = require('dw/system/System');
		switch(System.instanceType){
			case System.DEVELOPMENT_SYSTEM:
				return 'DEVELOPMENT_SYSTEM';
			case System.PRODUCTION_SYSTEM:
				return 'PRODUCTION_SYSTEM';
			case System.STAGING_SYSTEM:
				return 'STAGING_SYSTEM';
		}
	}
	var message = getParam('message'),
		Site = require('dw/system/Site');
	response.setStatus(200);
	return {
		'siteID':		Site.current.ID,
		'instanceType':	_getInstanceType(),
		'message': 		message
	};
}

exports.Get = guarantor(['GET'], ['giftCertificateCode'], getGiftCertificate);
exports.Get.public = true;
exports.Create = guarantor(['POST'], ['balance'], createGiftCertificate);
exports.Create.public = true;
exports.Disable = guarantor(['POST'], ['giftCertificateCode'], disableCertificate);
exports.Disable.public = true;
exports.Test = guarantor(['POST'], ['message'], test);
exports.Test.public = true;
