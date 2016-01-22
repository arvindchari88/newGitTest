var PolyAnnotation, PolySelectTool, PolySelectToolView, SelectTool, _,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

_ = require("underscore");

SelectTool = require("./select_tool");

PolyAnnotation = require("../../renderer/annotation/poly_annotation");

PolySelectToolView = (function(superClass) {
  extend(PolySelectToolView, superClass);

  function PolySelectToolView() {
    return PolySelectToolView.__super__.constructor.apply(this, arguments);
  }

  PolySelectToolView.prototype.initialize = function(options) {
    PolySelectToolView.__super__.initialize.call(this, options);
    this.listenTo(this.model, 'change:active', this._active_change);
    return this.data = null;
  };

  PolySelectToolView.prototype._active_change = function() {
    if (!this.mget('active')) {
      return this._clear_data();
    }
  };

  PolySelectToolView.prototype._keyup = function(e) {
    if (e.keyCode === 13) {
      return this._clear_data();
    }
  };

  PolySelectToolView.prototype._doubletap = function(e) {
    var append, ref;
    append = (ref = e.srcEvent.shiftKey) != null ? ref : false;
    this._select(this.data.vx, this.data.vy, true, append);
    return this._clear_data();
  };

  PolySelectToolView.prototype._clear_data = function() {
    this.data = null;
    return this.mget('overlay').update({
      xs: [],
      ys: []
    });
  };

  PolySelectToolView.prototype._tap = function(e) {
    var canvas, new_data, overlay, vx, vy;
    canvas = this.plot_view.canvas;
    vx = canvas.sx_to_vx(e.bokeh.sx);
    vy = canvas.sy_to_vy(e.bokeh.sy);
    if (this.data == null) {
      this.data = {
        vx: [vx],
        vy: [vy]
      };
      return null;
    }
    this.data.vx.push(vx);
    this.data.vy.push(vy);
    overlay = this.mget('overlay');
    new_data = {};
    new_data.vx = _.clone(this.data.vx);
    new_data.vy = _.clone(this.data.vy);
    return overlay.update({
      xs: this.data.vx,
      ys: this.data.vy
    });
  };

  PolySelectToolView.prototype._select = function(vx, vy, final, append) {
    var ds, geometry, i, len, r, ref, sm;
    geometry = {
      type: 'poly',
      vx: vx,
      vy: vy
    };
    ref = this.mget('renderers');
    for (i = 0, len = ref.length; i < len; i++) {
      r = ref[i];
      ds = r.get('data_source');
      sm = ds.get('selection_manager');
      sm.select(this, this.plot_view.renderers[r.id], geometry, final, append);
    }
    this._save_geometry(geometry, final, append);
    return null;
  };

  return PolySelectToolView;

})(SelectTool.View);

PolySelectTool = (function(superClass) {
  extend(PolySelectTool, superClass);

  function PolySelectTool() {
    return PolySelectTool.__super__.constructor.apply(this, arguments);
  }

  PolySelectTool.prototype.default_view = PolySelectToolView;

  PolySelectTool.prototype.type = "PolySelectTool";

  PolySelectTool.prototype.tool_name = "Poly Select";

  PolySelectTool.prototype.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAQCAYAAAAbBi9cAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAGdSURBVDiNjdO/axRBGMbxT8IiwSBBi4AiBBVRJE3UIqIIilrYLGuxMYo/AimsrNTCWkH/AbFR78Dc5dZiWW3SKQaVaKWlIFEiithooaiIZ7EbPM7b3D0wzLzzvvOdZ5iZviTNmnKN4gE2YSteYjW24A2+Yh/ux1G4uVij2cyXB0V8AYuYwBq8x5Ei/wEH8LNoHRVgWxyFr4v4RUvuScv4ESRpFhTQ/9SPmSTNdpbt1KZhXCsD7cZQj6AB7OqUCDCCTz2C3mF/maNnGOsRtB53y0BD/t1eN32T32pH0HY870ZI0mwMFZwvA73F+AqA4STNduCS3PlSpdbY0F4XFKAfJZA9mMO9OAonl+crtcZcpdaYP3ti4mqro0Py79AKOJqk2TwGMRVH4XTbHqtwpVJrVKv1ZGDZ0SIO4mGSZqNYh2m8wtM4Cr93MPur6E9jY7WenAvkz38pSbO9eIzrcRQe63TUFg3iDz7iIj73Yxa3i4LxOAovr0S4MzPbhzoOYy1GzkzGXwLcxC0sxFH4u4sTUyePN3EDKrXGAk4h/QvU5XGB9rRYawAAAABJRU5ErkJggg==";

  PolySelectTool.prototype.event_type = "tap";

  PolySelectTool.prototype.default_order = 11;

  PolySelectTool.prototype.defaults = function() {
    return _.extend({}, PolySelectTool.__super__.defaults.call(this), {
      overlay: new PolyAnnotation.Model({
        xs_units: "screen",
        ys_units: "screen",
        fill_color: "lightgrey",
        fill_alpha: 0.5,
        line_color: "black",
        line_alpha: 1.0,
        line_width: 2,
        line_dash: [4, 4]
      })
    });
  };

  PolySelectTool.prototype.initialize = function(attrs, options) {
    PolySelectTool.__super__.initialize.call(this, attrs, options);
    return this.get('overlay').set('silent_update', true, {
      silent: true
    });
  };

  return PolySelectTool;

})(SelectTool.Model);

module.exports = {
  Model: PolySelectTool,
  View: PolySelectToolView
};
