var Collections, ColumnDataSource, FactorRange, Logging, Range1d, _, _get_axis_type, _get_num_minor_ticks, _get_range, _get_sources, _process_annotations, _process_glyphs, _process_guides, _process_tools, add_annotations, add_glyphs, add_guides, add_tools, base, figure, helpers, logger, make_plot, make_sources;

_ = require("underscore");

base = require("../common/base");

Logging = require("../common/logging");

FactorRange = require("../range/factor_range");

Range1d = require("../range/range1d");

ColumnDataSource = require("../source/column_data_source");

helpers = "./helpers";

Collections = base.Collections;

logger = Logging.logger;

_get_num_minor_ticks = function(axis_type, num_minor_ticks) {
  if (num_minor_ticks == null) {
    return 0;
  }
  if (_.isNumber(num_minor_ticks)) {
    if (num_minor_ticks <= 1) {
      logger.error("num_minor_ticks must be > 1");
      num_minor_ticks = 0;
    }
    return num_minor_ticks;
  }
  if (num_minor_ticks === 'auto') {
    if ((axis_type != null) === "Log") {
      return 10;
    }
    return 5;
  }
  logger.error("unrecognized num_minor_ticks: " + num_minor_ticks);
  return 0;
};

_get_axis_type = function(axis_type, range) {
  var e, error, error1;
  if (axis_type == null) {
    return null;
  }
  if (axis_type === "auto") {
    if (range instanceof FactorRange.Model) {
      return Collections("CategoricalAxis");
    } else if (range instanceof Range1d.Model) {
      try {
        new Date.parse(range.get('start'));
        return Collections("DatetimeAxis");
      } catch (error) {
        e = error;
        "pass";
      }
      return Collections("LinearAxis");
    }
  }
  try {
    return Collections(axis_type + "Axis");
  } catch (error1) {
    e = error1;
    logger.error("unrecognized axis_type: " + axis_type);
    return null;
  }
};

_get_range = function(range) {
  if (range == null) {
    return Collections("DataRange1d").create();
  }
  if (_.isArray(range)) {
    if (_.every(range, _.isString)) {
      return Collections("FactorRange").create({
        factors: range
      });
    }
    if (range.length === 2 && _.every(range, _.isNumber)) {
      return Collections("Range1d").create({
        start: range[0],
        end: range[1]
      });
    }
  }
  logger.error("Unrecognized range input: " + range.toJSON);
  return null;
};

_get_sources = function(sources, glyph_source) {
  if (glyph_source instanceof ColumnDataSource.Model) {
    return glyph_source;
  }
  if (_.isString(glyph_source)) {
    return sources[glyph_source];
  }
  return Collections("ColumnDataSource").create({
    data: glyph_source
  });
};

_process_annotations = function(annotations) {
  var annotation_objs;
  annotation_objs = [];
  return annotation_objs;
};

_process_tools = function(tools, plot) {
  var e, error, i, len, tool, tool_args, tool_obj, tool_objs, tool_type;
  tool_objs = [];
  for (i = 0, len = tools.length; i < len; i++) {
    tool = tools[i];
    if (_.isString(tool)) {
      tool_type = tool + "Tool";
      tool_args = {
        plot: plot
      };
    } else {
      tool_type = tool.type + "Tool";
      tool_args = _.omit(tool, "type");
    }
    try {
      tool_obj = Collections(tool_type).create(tool_args);
      tool_objs.push(tool_obj);
    } catch (error) {
      e = error;
      logger.error("unrecognized tool: " + tool);
    }
  }
  return tool_objs;
};

_process_glyphs = function(glyphs, sources) {
  var glyph, glyph_args, glyph_obj, glyph_type, i, j, len, len1, ref, renderer, renderer_args, renderers, source, x, x_args, x_obj;
  renderers = [];
  for (i = 0, len = glyphs.length; i < len; i++) {
    glyph = glyphs[i];
    glyph_type = glyph.type;
    source = _get_sources(sources, glyph.source);
    glyph_args = _.omit(glyph, 'source', 'selection', 'inspection', 'nonselection');
    glyph_obj = Collections(glyph_type).create(glyph_args);
    renderer_args = {
      data_source: source,
      glyph: glyph_obj
    };
    ref = ['selection', 'inspection', 'nonselection'];
    for (j = 0, len1 = ref.length; j < len1; j++) {
      x = ref[j];
      if (glyph[x] != null) {
        if (glyph[x].type != null) {
          x_args = _.omit(glyph[x], 'type');
          x_obj = Collections(glyph[x].type).create(x_args);
        } else {
          x_obj = _.clone(glyph_obj);
          x_obj.set(glyph[x]);
        }
        renderer_args[x] = x_obj;
      }
    }
    renderer = Collections("GlyphRenderer").create(renderer_args);
    renderers.push(renderer);
  }
  return renderers;
};

_process_guides = function(guides, plot) {
  var axis, axis_args, axis_type, dim, grid, guide, guide_objs, i, len, location, range;
  guide_objs = [];
  for (i = 0, len = guides.length; i < len; i++) {
    guide = guides[i];
    location = guide.location;
    if (location === "below" || location === "above") {
      dim = 0;
      range = plot.get('x_range');
    } else if (location === "left" || location === "right") {
      dim = 1;
      range = plot.get('y_range');
    } else {
      logger.error("unrecognized axis location: " + location);
      continue;
    }
    axis_type = _get_axis_type(guide.type, range);
    axis_args = _.omit(guide, 'type', 'grid');
    axis_args['plot'] = plot;
    axis = axis_type.create(axis_args);
    guide_objs.push(axis);
    if (guide.grid === true) {
      grid = Collections("Grid").create({
        dimension: dim,
        plot: plot,
        ticker: axis.get('ticker')
      });
      guide_objs.push(grid);
    }
  }
  return guide_objs;
};

make_plot = function(options) {
  var plot;
  options.x_range = _get_range(options.x_range);
  options.y_range = _get_range(options.y_range);
  plot = Collections('Plot').create(options);
  return plot;
};

make_sources = function(data) {
  var key, source_objs, value;
  source_objs = {};
  for (key in data) {
    value = data[key];
    source_objs[key] = Collections("ColumnDataSource").create({
      data: value
    });
  }
  return source_objs;
};

add_glyphs = function(plot, sources, glyphs) {
  glyphs = _process_glyphs(glyphs, sources);
  return plot.add_renderers(glyphs);
};

add_guides = function(plot, guides) {
  var guide, i, len, loc, location;
  guides = _process_guides(guides, plot);
  for (i = 0, len = guides.length; i < len; i++) {
    guide = guides[i];
    location = guide.get('location');
    if (location != null) {
      loc = plot.get(location);
      loc.push(guide);
      plot.set(location, loc);
    }
  }
  return plot.add_renderers(guides);
};

add_annotations = function(plot, annotations) {
  annotations = _process_annotations(annotations);
  return plot.add_renderers(annotations);
};

add_tools = function(plot, tools) {
  var i, len, tool;
  tools = _process_tools(tools, plot);
  for (i = 0, len = tools.length; i < len; i++) {
    tool = tools[i];
    tool.set('plot', plot);
  }
  plot.set_obj('tools', tools);
  plot.get('tool_manager').set_obj('tools', tools);
  return plot.get('tool_manager')._init_tools();
};

figure = function(arg) {
  var annotations, glyphs, guides, options, plot, sources, tools;
  options = arg.options, sources = arg.sources, glyphs = arg.glyphs, guides = arg.guides, annotations = arg.annotations, tools = arg.tools;
  if (options == null) {
    options = {};
  }
  if (sources == null) {
    sources = {};
  }
  if (glyphs == null) {
    glyphs = [];
  }
  if (guides == null) {
    guides = [];
  }
  if (annotations == null) {
    annotations = {};
  }
  if (tools == null) {
    tools = [];
  }
  plot = make_plot(options);
  sources = make_sources(sources);
  add_glyphs(plot, sources, glyphs);
  add_guides(plot, guides);
  add_annotations(plot, annotations);
  add_tools(plot, tools);
  return plot;
};

module.exports = figure;
