var ActionTool, HelpTool, HelpToolView, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

ActionTool = require("./action_tool");

HelpToolView = (function(superClass) {
  extend(HelpToolView, superClass);

  function HelpToolView() {
    return HelpToolView.__super__.constructor.apply(this, arguments);
  }

  HelpToolView.prototype["do"] = function() {
    return window.open(this.mget('redirect'));
  };

  return HelpToolView;

})(ActionTool.View);

HelpTool = (function(superClass) {
  extend(HelpTool, superClass);

  function HelpTool() {
    return HelpTool.__super__.constructor.apply(this, arguments);
  }

  HelpTool.prototype.default_view = HelpToolView;

  HelpTool.prototype.type = "HelpTool";

  HelpTool.prototype.tool_name = "Help";

  HelpTool.prototype.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo3NzIwRUFGMDYyMjE2ODExOTdBNUNBNjVEQTY5OTRDRSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozMjFERDhDRjIwQjIxMUU0ODREQUYzNzM5QTM2MjBCRSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozMjFERDhDRTIwQjIxMUU0ODREQUYzNzM5QTM2MjBCRSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M1LjEgTWFjaW50b3NoIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6OTdFQUZCRjQ4NjIxNjgxMTk3QTVDQTY1REE2OTk0Q0UiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NzcyMEVBRjA2MjIxNjgxMTk3QTVDQTY1REE2OTk0Q0UiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6QBYrgAAABb0lEQVR42ozTwUeEQRjH8W3bKEs6JkpESqfVpS4RHaJL2b2sLepUh3To0KFVIjp0iegQUdG21WmVvUWsKBGRlIiU7Q+IVaT0ffi9eY33peFj7cw8zzvzzEzV7v5hxGltGEUvutR3hwvs4ck/OeoET6KACrJolaz6Cprz12L6rcEOajGEFyfxtRxhDX0Yx5e3ggV8IqlgW/4J3vCKddRrLKm5894KOjGCHiVrwDZ+sKKvpRQ0pzkzuETeEqSxpT1aa8ezCmbyuEW3b0sVxaQtQT+mfINXGPT9T+n3xqnLKTYsQQseI8FtWnstYdEZs9o0eqdQZxUNSWD9YwHj36i2UyijOWQFVvmPkOR2P8qW4AwDIQma0BEyZjGlqCo9gXjA1+0ePAQExxWTtwT3KOqG/bfZ3GOL9W7ikrIe6FSsvQdswcZymrvsf0xWpIzqYauZRcIXmFBfUUea8Qobc5a2qQtiz3nVec7nGHaf868AAwDKW1RIPmvhEQAAAABJRU5ErkJggg==";

  HelpTool.prototype.initialize = function(attrs, options) {
    HelpTool.__super__.initialize.call(this, attrs, options);
    return this.register_property('tooltip', function() {
      return this.get('help_tooltip');
    });
  };

  HelpTool.prototype.defaults = function() {
    return _.extend({}, HelpTool.__super__.defaults.call(this), {
      help_tooltip: 'Click the question mark to learn more about Bokeh plot tools.',
      redirect: 'http://bokeh.pydata.org/en/latest/docs/user_guide/tools.html'
    });
  };

  return HelpTool;

})(ActionTool.Model);

module.exports = {
  Model: HelpTool,
  View: HelpToolView
};
