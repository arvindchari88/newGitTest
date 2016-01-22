var HasProperties, Transform, _make_transform,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

HasProperties = require("../common/has_properties");

Transform = (function(superClass) {
  extend(Transform, superClass);

  function Transform() {
    return Transform.__super__.constructor.apply(this, arguments);
  }

  return Transform;

})(HasProperties);

_make_transform = function(name) {
  var holder;
  holder = {};
  holder.Model = (function(superClass) {
    extend(_Class, superClass);

    function _Class() {
      return _Class.__super__.constructor.apply(this, arguments);
    }

    _Class.prototype.type = name;

    return _Class;

  })(Transform);
  return holder;
};

module.exports = {
  AutoEncode: _make_transform("AutoEncode"),
  BinarySegment: _make_transform("BinarySegment"),
  Const: _make_transform("Const"),
  Contour: _make_transform("Contour"),
  Count: _make_transform("Count"),
  CountCategories: _make_transform("CountCategories"),
  Cuberoot: _make_transform("Cuberoot"),
  Encode: _make_transform("Encode"),
  HDAlpha: _make_transform("HDAlpha"),
  Id: _make_transform("Id"),
  Interpolate: _make_transform("Interpolate"),
  InterpolateColor: _make_transform("InterpolateColor"),
  Log: _make_transform("Log"),
  NonZero: _make_transform("NonZero"),
  Ratio: _make_transform("Ratio"),
  Seq: _make_transform("Seq"),
  Spread: _make_transform("Spread"),
  ToCounts: _make_transform("ToCounts")
};
