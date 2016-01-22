var HasProperties, ToolEvents, _, logger,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

HasProperties = require("./has_properties");

logger = require("./logging").logger;

ToolEvents = (function(superClass) {
  extend(ToolEvents, superClass);

  function ToolEvents() {
    return ToolEvents.__super__.constructor.apply(this, arguments);
  }

  ToolEvents.prototype.type = 'ToolEvents';

  ToolEvents.prototype.defaults = function() {
    return _.extend({}, ToolEvents.__super__.defaults.call(this), {
      geometries: []
    });
  };

  return ToolEvents;

})(HasProperties);

module.exports = {
  Model: ToolEvents
};
