var Annotation, HasParent, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

HasParent = require("../../common/has_parent");

Annotation = (function(superClass) {
  extend(Annotation, superClass);

  function Annotation() {
    return Annotation.__super__.constructor.apply(this, arguments);
  }

  Annotation.prototype.type = 'Annotation';

  Annotation.prototype.defaults = function() {
    return _.extend({}, Annotation.__super__.defaults.call(this), {
      level: 'overlay',
      plot: null
    });
  };

  return Annotation;

})(HasParent);

module.exports = {
  Model: Annotation
};
