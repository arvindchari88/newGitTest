conda = nodeRequire 'conda'

class Env extends Backbone.Model
  sync: conda.Env.backboneSync

module.exports = Env
