var BoxAnnotation, BoxSelectTool, BoxSelectToolView, SelectTool, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

SelectTool = require("./select_tool");

BoxAnnotation = require("../../renderer/annotation/box_annotation");

BoxSelectToolView = (function(superClass) {
  extend(BoxSelectToolView, superClass);

  function BoxSelectToolView() {
    return BoxSelectToolView.__super__.constructor.apply(this, arguments);
  }

  BoxSelectToolView.prototype._pan_start = function(e) {
    var canvas;
    canvas = this.plot_view.canvas;
    this._baseboint = [canvas.sx_to_vx(e.bokeh.sx), canvas.sy_to_vy(e.bokeh.sy)];
    return null;
  };

  BoxSelectToolView.prototype._pan = function(e) {
    var append, canvas, curpoint, dims, frame, ref, ref1, vxlim, vylim;
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
    if (this.mget('select_every_mousemove')) {
      append = (ref1 = e.srcEvent.shiftKey) != null ? ref1 : false;
      this._select(vxlim, vylim, false, append);
    }
    return null;
  };

  BoxSelectToolView.prototype._pan_end = function(e) {
    var append, canvas, curpoint, dims, frame, ref, ref1, vxlim, vylim;
    canvas = this.plot_view.canvas;
    curpoint = [canvas.sx_to_vx(e.bokeh.sx), canvas.sy_to_vy(e.bokeh.sy)];
    frame = this.plot_model.get('frame');
    dims = this.mget('dimensions');
    ref = this.model._get_dim_limits(this._baseboint, curpoint, frame, dims), vxlim = ref[0], vylim = ref[1];
    append = (ref1 = e.srcEvent.shiftKey) != null ? ref1 : false;
    this._select(vxlim, vylim, true, append);
    this.mget('overlay').update({
      left: null,
      right: null,
      top: null,
      bottom: null
    });
    this._baseboint = null;
    return null;
  };

  BoxSelectToolView.prototype._select = function(arg, arg1, final, append) {
    var ds, geometry, i, len, r, ref, sm, vx0, vx1, vy0, vy1;
    vx0 = arg[0], vx1 = arg[1];
    vy0 = arg1[0], vy1 = arg1[1];
    if (append == null) {
      append = false;
    }
    geometry = {
      type: 'rect',
      vx0: vx0,
      vx1: vx1,
      vy0: vy0,
      vy1: vy1
    };
    ref = this.mget('renderers');
    for (i = 0, len = ref.length; i < len; i++) {
      r = ref[i];
      ds = r.get('data_source');
      sm = ds.get('selection_manager');
      sm.select(this, this.plot_view.renderers[r.id], geometry, final, append);
    }
    if (this.mget('callback') != null) {
      this._emit_callback(geometry);
    }
    this._save_geometry(geometry, final, append);
    return null;
  };

  BoxSelectToolView.prototype._emit_callback = function(geometry) {
    var canvas, frame, r, xmapper, ymapper;
    r = this.mget('renderers')[0];
    canvas = this.plot_model.get('canvas');
    frame = this.plot_model.get('frame');
    geometry['sx0'] = canvas.vx_to_sx(geometry.vx0);
    geometry['sx1'] = canvas.vx_to_sx(geometry.vx1);
    geometry['sy0'] = canvas.vy_to_sy(geometry.vy0);
    geometry['sy1'] = canvas.vy_to_sy(geometry.vy1);
    xmapper = frame.get('x_mappers')[r.get('x_range_name')];
    ymapper = frame.get('y_mappers')[r.get('y_range_name')];
    geometry['x0'] = xmapper.map_from_target(geometry.vx0);
    geometry['x1'] = xmapper.map_from_target(geometry.vx1);
    geometry['y0'] = ymapper.map_from_target(geometry.vy0);
    geometry['y1'] = ymapper.map_from_target(geometry.vy1);
    this.mget('callback').execute(this.model, {
      geometry: geometry
    });
  };

  return BoxSelectToolView;

})(SelectTool.View);

BoxSelectTool = (function(superClass) {
  extend(BoxSelectTool, superClass);

  function BoxSelectTool() {
    return BoxSelectTool.__super__.constructor.apply(this, arguments);
  }

  BoxSelectTool.prototype.default_view = BoxSelectToolView;

  BoxSelectTool.prototype.type = "BoxSelectTool";

  BoxSelectTool.prototype.tool_name = "Box Select";

  BoxSelectTool.prototype.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAgCAYAAAB6kdqOAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNS4xIE1hY2ludG9zaCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpBODVDNDBCRjIwQjMxMUU0ODREQUYzNzM5QTM2MjBCRSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpBODVDNDBDMDIwQjMxMUU0ODREQUYzNzM5QTM2MjBCRSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkE4NUM0MEJEMjBCMzExRTQ4NERBRjM3MzlBMzYyMEJFIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkE4NUM0MEJFMjBCMzExRTQ4NERBRjM3MzlBMzYyMEJFIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+hdQ7dQAAAJdJREFUeNpiXLhs5X8GBPgIxAJQNjZxfiD+wIAKGCkUZ0SWZGIYZIAF3YVoPkEHH6kojhUMyhD6jydEaAlgaWnwh9BAgf9DKpfxDxYHjeay0Vw2bHMZw2guG81lwyXKRnMZWlt98JdDTFAX/x9NQwPkIH6kGMAVEyjyo7lstC4jouc69Moh9L42rlyBTZyYXDS00xBAgAEAqsguPe03+cYAAAAASUVORK5CYII=";

  BoxSelectTool.prototype.event_type = "pan";

  BoxSelectTool.prototype.default_order = 30;

  BoxSelectTool.prototype.initialize = function(attrs, options) {
    BoxSelectTool.__super__.initialize.call(this, attrs, options);
    this.get('overlay').set('silent_update', true, {
      silent: true
    });
    this.register_property('tooltip', function() {
      return this._get_dim_tooltip(this.get("tool_name"), this._check_dims(this.get('dimensions'), "box select tool"));
    }, false);
    return this.add_dependencies('tooltip', this, ['dimensions']);
  };

  BoxSelectTool.prototype.defaults = function() {
    return _.extend({}, BoxSelectTool.__super__.defaults.call(this), {
      dimensions: ["width", "height"],
      select_every_mousemove: false,
      callback: null,
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

  return BoxSelectTool;

})(SelectTool.Model);

module.exports = {
  Model: BoxSelectTool,
  View: BoxSelectToolView
};
