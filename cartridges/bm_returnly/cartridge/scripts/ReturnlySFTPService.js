"use strict";

var ServiceRegistry = require('dw/svc/ServiceRegistry'),
    SFTPService = function () {};

SFTPService.prototype =  {
	service: ServiceRegistry.get('bm_returnly.sftp.auth'),
    call: function (options) {
        return this.service.call(options);
    }
};

module.exports = new SFTPService();