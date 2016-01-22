App = require 'models/app'
conda = nodeRequire 'conda'
error_alert_template = require 'views/error_alert'

parseFn = (fn) ->
  fn = fn.slice(0, -8)
  parts = fn.split('-')
  build = parts[parts.length - 1]
  return {
    build: build
    version: parts[parts.length - 2]
    name: parts.slice(0, -2).join('-')
    buildno: parseInt(build.split('_')[1], 10)
    pyver: parseInt(build.split('_')[0].slice(2), 10)
    }

firstTime = true

AppCollection = Backbone.Collection.extend
  model: App

  initialize: (models, options) ->
    @env = options.env

  sync: (method, model, options) ->
    if not options.reload?
      options.reload = firstTime
      firstTime = false
    @env.attributes.linked({ simple: true }).then (linked) =>
      time1 = Date.now()

      conda.index(reload: (options.reload? and options.reload), unknown: true).then (index) =>
        console.log "Fetching apps installed in", @env.get 'name'
        apps = {}

        if index.error? and index.error_type?
          $('.app-panel-content').append error_alert_template
            title: "Error fetching package index"
            error: index.error

        for own name, pkgs of index
          # We rely on the fact that the index is ordered by version
          # The exact python version/build doesn't matter to us so long as
          # the name is correct and we have the most recent metadata

          if not _.any(pkgs, (pkg) -> (pkg.type and pkg.type is 'app') or (pkg.app_type?))
            continue

          # Favor the version that is installed
          pkg = _.filter pkgs, (pkg) ->
            linked.indexOf(pkg.fn.slice(0, -8)) > -1

          if pkg.length is 0
            pkg = _.last(pkgs)
          else
            pkg = pkg[0]

          apps[name] = pkg

        for own name, pkg of @env.attributes.installed
          if apps.hasOwnProperty name
            continue
          pkg = pkg.info
          if (pkg.type? and pkg.type is 'app') or pkg.app_type?
            apps[name] = pkg

        appindex = {}
        for own name, pkg of apps
          pkg = _.clone(pkg)  # conda-js caches package objects
          pkg.name = name
          pkg.appid = pkg.fn
          pkg.installed = linked.indexOf(pkg.fn.slice(0, -8)) > -1
          pkg.icon_url = pkg.icon
          pkg.hasUpdate = false
          pkg.app_own_environment = pkg.app_own_environment? and pkg.app_own_environment
          pkg.syncedfrom = @env.get('name')
          appindex[name] = pkg

        # Check if any have updates by doing a dry run (saves us from
        # reimplementing version comparison logic)
        promises = []
        for name, current of appindex
          if not current.installed
            continue

          do (name) =>
            promise = @env.attributes.update
              dryRun: true
              packages: [name]
              useIndexCache: true
              forcePscheck: true  # Needed on win32, else it errors - but we're just doing a dry run
            promise.then (result) =>
              if result.actions? and result.actions.LINK?
                appindex[name].hasUpdate = true

            promises.push promise

        Promise.all(promises).then =>
          console.log 'Fetched apps in', Date.now() - time1
          options.success
            apps: appindex

module.exports = AppCollection
