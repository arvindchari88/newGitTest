var GestureTool, PanTool, PanToolView, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

GestureTool = require("./gesture_tool");

PanToolView = (function(superClass) {
  extend(PanToolView, superClass);

  function PanToolView() {
    return PanToolView.__super__.constructor.apply(this, arguments);
  }

  PanToolView.prototype._pan_start = function(e) {
    var canvas, frame, hr, vr, vx, vy;
    this.last_dx = 0;
    this.last_dy = 0;
    canvas = this.plot_view.canvas;
    frame = this.plot_view.frame;
    vx = canvas.sx_to_vx(e.bokeh.sx);
    vy = canvas.sy_to_vy(e.bokeh.sy);
    if (!frame.contains(vx, vy)) {
      hr = frame.get('h_range');
      vr = frame.get('v_range');
      if (vx < hr.get('start') || vx > hr.get('end')) {
        this.v_axis_only = true;
      }
      if (vy < vr.get('start') || vy > vr.get('end')) {
        this.h_axis_only = true;
      }
    }
    return this.plot_view.interactive_timestamp = Date.now();
  };

  PanToolView.prototype._pan = function(e) {
    this._update(e.deltaX, -e.deltaY);
    return this.plot_view.interactive_timestamp = Date.now();
  };

  PanToolView.prototype._pan_end = function(e) {
    this.h_axis_only = false;
    return this.v_axis_only = false;
  };

  PanToolView.prototype._update = function(dx, dy) {
    var dims, end, frame, hr, is_panning, mapper, name, new_dx, new_dy, pan_info, ref, ref1, ref2, ref3, sdx, sdy, start, sx0, sx1, sx_high, sx_low, sy0, sy1, sy_high, sy_low, vr, xrs, yrs;
    frame = this.plot_view.frame;
    new_dx = dx - this.last_dx;
    new_dy = dy - this.last_dy;
    hr = _.clone(frame.get('h_range'));
    sx_low = hr.get('start') - new_dx;
    sx_high = hr.get('end') - new_dx;
    vr = _.clone(frame.get('v_range'));
    sy_low = vr.get('start') - new_dy;
    sy_high = vr.get('end') - new_dy;
    dims = this.mget('dimensions');
    if (dims.indexOf('width') > -1 && !this.v_axis_only) {
      sx0 = sx_low;
      sx1 = sx_high;
      sdx = -new_dx;
    } else {
      sx0 = hr.get('start');
      sx1 = hr.get('end');
      sdx = 0;
    }
    if (dims.indexOf('height') > -1 && !this.h_axis_only) {
      sy0 = sy_low;
      sy1 = sy_high;
      sdy = new_dy;
    } else {
      sy0 = vr.get('start');
      sy1 = vr.get('end');
      sdy = 0;
    }
    this.last_dx = dx;
    this.last_dy = dy;
    xrs = {};
    ref = frame.get('x_mappers');
    for (name in ref) {
      mapper = ref[name];
      ref1 = mapper.v_map_from_target([sx0, sx1], true), start = ref1[0], end = ref1[1];
      xrs[name] = {
        start: start,
        end: end
      };
    }
    yrs = {};
    ref2 = frame.get('y_mappers');
    for (name in ref2) {
      mapper = ref2[name];
      ref3 = mapper.v_map_from_target([sy0, sy1], true), start = ref3[0], end = ref3[1];
      yrs[name] = {
        start: start,
        end: end
      };
    }
    pan_info = {
      xrs: xrs,
      yrs: yrs,
      sdx: sdx,
      sdy: sdy
    };
    this.plot_view.update_range(pan_info, is_panning = true);
    return null;
  };

  return PanToolView;

})(GestureTool.View);

PanTool = (function(superClass) {
  extend(PanTool, superClass);

  function PanTool() {
    return PanTool.__super__.constructor.apply(this, arguments);
  }

  PanTool.prototype.default_view = PanToolView;

  PanTool.prototype.type = "PanTool";

  PanTool.prototype.tool_name = "Pan";

  PanTool.prototype.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpCRTI5MDhEODIwQjUxMUU0ODREQUYzNzM5QTM2MjBCRSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpCRTI5MDhEOTIwQjUxMUU0ODREQUYzNzM5QTM2MjBCRSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkJFMjkwOEQ2MjBCNTExRTQ4NERBRjM3MzlBMzYyMEJFIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkJFMjkwOEQ3MjBCNTExRTQ4NERBRjM3MzlBMzYyMEJFIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+OXzPwwAAAKNJREFUeNrsVsEKgCAM3cyj0f8fuwT9XdEHrLyVIOKYY4kPPDim0+fenF+3HZi4nhFec+Rs4oCPAALwjDVUsKMWA6DNAFX6YXcMYIERdRWIYBzAZbKYGsSKex6mVUAK8Za0TphgoFTbpSvlx3/I0EQOILO2i/ibegLk/mgVONM4JvuBVizgkGH3XTGrR/xlV0ycbO8qCeMN54wdtVQwSTFwCzAATqEZUn8W8W4AAAAASUVORK5CYII=";

  PanTool.prototype.event_type = "pan";

  PanTool.prototype.default_order = 10;

  PanTool.prototype.initialize = function(attrs, options) {
    PanTool.__super__.initialize.call(this, attrs, options);
    this.register_property('tooltip', function() {
      return this._get_dim_tooltip("Pan", this._check_dims(this.get('dimensions'), "pan tool"));
    }, false);
    return this.add_dependencies('tooltip', this, ['dimensions']);
  };

  PanTool.prototype.nonserializable_attribute_names = function() {
    return PanTool.__super__.nonserializable_attribute_names.call(this).concat(['level', 'default_order', 'event_type']);
  };

  PanTool.prototype.defaults = function() {
    return _.extend({}, PanTool.__super__.defaults.call(this), {
      dimensions: ["width", "height"]
    });
  };

  return PanTool;

})(GestureTool.Model);

module.exports = {
  Model: PanTool,
  View: PanToolView
};
