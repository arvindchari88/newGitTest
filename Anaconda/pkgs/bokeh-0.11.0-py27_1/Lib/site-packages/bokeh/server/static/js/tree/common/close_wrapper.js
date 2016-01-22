var CloseWrapper, ContinuumView, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

ContinuumView = require("./continuum_view");

CloseWrapper = (function(superClass) {
  extend(CloseWrapper, superClass);

  function CloseWrapper() {
    return CloseWrapper.__super__.constructor.apply(this, arguments);
  }

  CloseWrapper.prototype.attributes = {
    "class": "bk-closewrapper"
  };

  CloseWrapper.prototype.delegateEvents = function(events) {
    return CloseWrapper.__super__.delegateEvents.call(this, events);
  };

  CloseWrapper.prototype.events = {
    "click .bk-close": "close"
  };

  CloseWrapper.prototype.close = function(options) {
    this.view.remove();
    return this.remove();
  };

  CloseWrapper.prototype.initialize = function(options) {
    CloseWrapper.__super__.initialize.call(this, options);
    this.view = options.view;
    return this.render();
  };

  CloseWrapper.prototype.render = function() {
    this.view.$el.detach();
    this.$el.empty();
    this.$el.html("<a href='#' class='bk-close'>[x]</a>");
    return this.$el.append(this.view.$el);
  };

  return CloseWrapper;

})(ContinuumView);

module.exports = {
  View: CloseWrapper
};
