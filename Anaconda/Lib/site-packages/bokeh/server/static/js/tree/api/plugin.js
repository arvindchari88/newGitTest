var $, Logging, _, _api, figure, helpers, logger, show;

_ = require("underscore");

$ = require("jquery");

Logging = require("../common/logging");

figure = require("./figure");

helpers = require("./helpers");

logger = Logging.logger;

show = helpers.show;

_api = {
  "figure": figure
};

$.fn.bokeh = function(type, args) {
  var obj;
  if (!(type in _api)) {
    logger.error("Unknown API type '" + type + "'. Recognized API types: " + (Object.keys(_api)));
    return this;
  }
  obj = _api[type](args);
  show(this, obj);
  return obj;
};

module.exports = $.fn.bokeh;
