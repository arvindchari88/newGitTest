var BoxAnnotation, BoxZoomTool, BoxZoomToolView, GestureTool, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

GestureTool = require("./gesture_tool");

BoxAnnotation = require("../../renderer/annotation/box_annotation");

BoxZoomToolView = (function(superClass) {
  extend(BoxZoomToolView, superClass);

  function BoxZoomToolView() {
    return BoxZoomToolView.__super__.constructor.apply(this, arguments);
  }

  BoxZoomToolView.prototype._pan_start = function(e) {
    var canvas;
    canvas = this.plot_view.canvas;
    this._baseboint = [canvas.sx_to_vx(e.bokeh.sx), canvas.sy_to_vy(e.bokeh.sy)];
    return null;
  };

  BoxZoomToolView.prototype._pan = function(e) {
    var canvas, curpoint, dims, frame, ref, vxlim, vylim;
    canvas = this.plot_view.canvas;
    curpoint = [canvas.sx_to_vx(e.bokeh.sx), canvas.sy_to_vy(e.bokeh.sy)];
    frame = this.plot_model.get('frame');
    dims = this.mget('dimensions');
    ref = this.model._get_dim_limits(this._baseboint, curpoint, frame, dims), vxlim = ref[0], vylim = ref[1];
    this.mget('overlay').update({
      left: vxlim[0],
      right: vxlim[1],
      top: vylim[1],
      bottom: vylim[0]
    });
    return null;
  };

  BoxZoomToolView.prototype._pan_end = function(e) {
    var canvas, curpoint, dims, frame, ref, vxlim, vylim;
    canvas = this.plot_view.canvas;
    curpoint = [canvas.sx_to_vx(e.bokeh.sx), canvas.sy_to_vy(e.bokeh.sy)];
    frame = this.plot_model.get('frame');
    dims = this.mget('dimensions');
    ref = this.model._get_dim_limits(this._baseboint, curpoint, frame, dims), vxlim = ref[0], vylim = ref[1];
    this._update(vxlim, vylim);
    this.mget('overlay').update({
      left: null,
      right: null,
      top: null,
      bottom: null
    });
    this._baseboint = null;
    return null;
  };

  BoxZoomToolView.prototype._update = function(vxlim, vylim) {
    var end, mapper, name, ref, ref1, ref2, ref3, start, xrs, yrs, zoom_info;
    if (Math.abs(vxlim[1] - vxlim[0]) <= 5 || Math.abs(vylim[1] - vylim[0]) <= 5) {
      return;
    }
    xrs = {};
    ref = this.plot_view.frame.get('x_mappers');
    for (name in ref) {
      mapper = ref[name];
      ref1 = mapper.v_map_from_target(vxlim, true), start = ref1[0], end = ref1[1];
      xrs[name] = {
        start: start,
        end: end
      };
    }
    yrs = {};
    ref2 = this.plot_view.frame.get('y_mappers');
    for (name in ref2) {
      mapper = ref2[name];
      ref3 = mapper.v_map_from_target(vylim, true), start = ref3[0], end = ref3[1];
      yrs[name] = {
        start: start,
        end: end
      };
    }
    zoom_info = {
      xrs: xrs,
      yrs: yrs
    };
    return this.plot_view.update_range(zoom_info);
  };

  return BoxZoomToolView;

})(GestureTool.View);

BoxZoomTool = (function(superClass) {
  extend(BoxZoomTool, superClass);

  function BoxZoomTool() {
    return BoxZoomTool.__super__.constructor.apply(this, arguments);
  }

  BoxZoomTool.prototype.default_view = BoxZoomToolView;

  BoxZoomTool.prototype.type = "BoxZoomTool";

  BoxZoomTool.prototype.tool_name = "Box Zoom";

  BoxZoomTool.prototype.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACIAAAAgCAYAAAB3j6rJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozMjFERDhEMjIwQjIxMUU0ODREQUYzNzM5QTM2MjBCRSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozMjFERDhEMzIwQjIxMUU0ODREQUYzNzM5QTM2MjBCRSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjMyMUREOEQwMjBCMjExRTQ4NERBRjM3MzlBMzYyMEJFIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjMyMUREOEQxMjBCMjExRTQ4NERBRjM3MzlBMzYyMEJFIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+a2Q0KAAAAmVJREFUeNq8V19EpFEUvzOtmKfpJSJKDL2WiLJExKaUEq0eeikiaolZLT2lVUpPydqHqIlIo1ilFOmphxj1miKWWHppnobIt7+zeyZ3jjvz/bnf9OPHd8/9d77z3XN+94ts7ew6SqksWKX+w1GFiLjYdVSAfeAQ2Ag2sf0GvAXT4C/wle1x3lt9UOGBNk6BrYa+FuYIeAWOsmNviGqe6W+q081OmAGvizgh0cpjZ3RjGBFZBpMG+xn4wM8NYJfWFwNXwXrwS96RiIUTwwYn6AxMgb+FvQ5c4zOUxzR4Ce5GLZyo5LfSsQP2G5xQbKO+bWFfoLWinA1OAEcoM2rFRpMe5sloJWgtm4j0iPZcPhVdkOWxBWvZONIi2uc+5sqxbTaO1Ij2o4+5T6JdGy1SF4Kg2mLsi01E/oh2l4+5HTKaNlmTEe0ka40XyNqTsYnIkWiTwC16rMRNci0bR0hJ7w1veizqy9uB5D4ZDZKBtI3WvLCCJoT9E3jHny4j1DdmWOcbrWWjNYuGoqaL2kdmKayTztio7yzTJprz4A/9PuI3a8YMh5IKVC9fetxAY5rB79pNzXdESMJ/GrSjm8/DCTjAgpjQZCDDh5I+w4HuQBBHOsE9USty4KB2KF85m9J+v5XX9KXr3T7fQZS26WefYlcU+ayJlxhDIT40jBnn21hQOPrfgFtEqAhdGETqK7gZ4h/Av4g4Jf5TUoYquQSuqJDhFpEJca3b4EoYOtyyhrSkHTzlcj4R4t4FZ9NL+j6yMzlT/ocZES9aky3D3r6y5t2gaw3xWXgs7XFhdyzsgSpr2fFXgAEAmp2J9DuX/WgAAAAASUVORK5CYII=";

  BoxZoomTool.prototype.event_type = "pan";

  BoxZoomTool.prototype.default_order = 20;

  BoxZoomTool.prototype.initialize = function(attrs, options) {
    BoxZoomTool.__super__.initialize.call(this, attrs, options);
    this.get('overlay').set('silent_update', true, {
      silent: true
    });
    this.register_property('tooltip', function() {
      return this._get_dim_tooltip(this.get("tool_name"), this._check_dims(this.get('dimensions'), "box zoom tool"));
    }, false);
    return this.add_dependencies('tooltip', this, ['dimensions']);
  };

  BoxZoomTool.prototype.defaults = function() {
    return _.extend({}, BoxZoomTool.__super__.defaults.call(this), {
      dimensions: ["width", "height"],
      overlay: new BoxAnnotation.Model({
        level: "overlay",
        render_mode: "css",
        top_units: "screen",
        left_units: "screen",
        bottom_units: "screen",
        right_units: "screen",
        fill_color: "lightgrey",
        fill_alpha: 0.5,
        line_color: "black",
        line_alpha: 1.0,
        line_width: 2,
        line_dash: [4, 4]
      })
    });
  };

  return BoxZoomTool;

})(GestureTool.Model);

module.exports = {
  Model: BoxZoomTool,
  View: BoxZoomToolView
};
