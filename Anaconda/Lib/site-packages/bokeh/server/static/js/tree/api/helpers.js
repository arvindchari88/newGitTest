var Logging, _, logger, show;

_ = require("underscore");

Logging = require("../common/logging");

logger = Logging.logger;

show = function(target, plot) {
  var myrender;
  logger.debug("Scheduling render for plot " + plot + " on target " + target);
  myrender = function() {
    var view;
    view = new plot.default_view({
      model: plot
    });
    return target.append(view.$el);
  };
  return _.defer(myrender);
};

module.exports = {
  show: show
};
