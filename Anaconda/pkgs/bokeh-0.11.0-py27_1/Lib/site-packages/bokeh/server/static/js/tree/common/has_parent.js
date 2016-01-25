var HasParent, HasProperties, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

HasProperties = require("./has_properties");

HasParent = (function(superClass) {
  extend(HasParent, superClass);

  function HasParent() {
    return HasParent.__super__.constructor.apply(this, arguments);
  }

  HasParent.prototype.initialize = function(attrs, options) {
    HasParent.__super__.initialize.call(this, attrs, options);
    return this._parent = HasProperties.prototype.get.apply(this, ['parent']);
  };

  HasParent.prototype.nonserializable_attribute_names = function() {
    return HasParent.__super__.nonserializable_attribute_names.call(this).concat(['parent']);
  };

  HasParent.prototype._display_defaults_cached = function() {
    if (this.constructor._display_defaults_cache == null) {
      this.constructor._display_defaults_cache = this.display_defaults();
    }
    return this.constructor._display_defaults_cache;
  };

  HasParent.prototype.get = function(attr, resolve_refs) {
    var val;
    if (resolve_refs == null) {
      resolve_refs = true;
    }
    if (attr === 'parent') {
      return this._parent;
    }
    val = HasParent.__super__.get.call(this, attr, resolve_refs);
    if (!_.isUndefined(val)) {
      return val;
    }
    if (this._parent && _.indexOf(this._parent.parent_properties, attr) >= 0) {
      val = this._parent.get(attr, resolve_refs);
      if (!_.isUndefined(val)) {
        return val;
      }
    }
    return this._display_defaults_cached()[attr];
  };

  HasParent.prototype.display_defaults = function() {
    return {};
  };

  return HasParent;

})(HasProperties);

module.exports = HasParent;
