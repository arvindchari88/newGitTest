var HasProperties, TickFormatter, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

HasProperties = require("../common/has_properties");

TickFormatter = (function(superClass) {
  extend(TickFormatter, superClass);

  function TickFormatter() {
    return TickFormatter.__super__.constructor.apply(this, arguments);
  }

  TickFormatter.prototype.type = 'TickFormatter';

  return TickFormatter;

})(HasProperties);

module.exports = {
  Model: TickFormatter
};
