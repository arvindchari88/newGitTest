conda = nodeRequire 'conda'

Setup = require 'lib/setup'
modal = require 'lib/modal'

item_template = require 'views/appitem'
install_template = require 'views/appinstall'
install_own_env_template = require 'views/appowninstall'
launch_template = require 'views/applaunch'
update_template = require 'views/appupdate'
error_noapps = require 'views/error_noapps'

AppCollection = require 'controllers/appController'

make_own_env_name = (app) ->
  '_app_own_environment_' + app

class AppView extends Backbone.View
  el: $("body")

  events:
    "click  .launch-btn" :        "launch"
    "click  .install-btn" :       "install"
    "click  .update-btn" :        "update"

  initialize: (models, options) =>
    @collections = {}
    @env = null

    console.log('initialize AppView')

    # set this modal event here so it is only set once.
    # if the event is set everytime an app is launched it will get set multiple times.
    $('#launch_modal').on 'shown', ->
      $('#launch_modal').fadeOut 3000, ->
        $('#launch_modal').modal 'hide'

  get_app: (e) ->
    return {
      appid: $(e.currentTarget).data('appid')
      appname: $(e.currentTarget).data('appname')
      own_environment: $(e.currentTarget).data('own-environment')
      environment: $(e.currentTarget).data('environment')
    }

  launch: (e) =>
    app = @get_app e
    console.log 'launch', app.appname, 'from', app.environment

    Setup.analyticsEvent "App", "Launched", app.appname

    html = launch_template
      name: app.appname
      environment: app.environment
    $('#launch_modal .modal-body').empty().append html
    $('#launch_modal').modal 'show'

    launch = @collections[app.environment].env.attributes.run { name: app.appname }
    launch.then (result) ->
      if result.error?
        Setup.analyticsEvent "App", "Launch Error", app.appname
        # jQuery apparently gets stuck in an infinite loop (-> crash) if two
        # dialogs are manipulated at the same instant, so wait for the
        # launch modal to fade
        setTimeout ->
          modal.error "Launch Error", "Error launching application:", result.error
        , 3000

  app_operation: (app, operation, title, template, success) ->
    modal.confirmWindowsProcess().then =>
      console.log operation, app.appname, 'into', app.environment

      html = template
        name: app.appname

      modal.show title, html

      if app.own_environment
        env = @collections[app.environment].env
        @collections[app.environment].reset()  # force launcher to refetch env
      else
        env = @env

      operation = env.attributes[operation]
        packages: [app.appname]
        progress: true
        forcePscheck: true

      modal.addProgress()
      modal.updateProgress(operation)
      operation.then (result) =>
        if result.success? and result.success
          modal.append "<p>#{app.appname} #{success}.</p>"
          modal.stopProgress().setProgressStatus('success')
          @activateEnvironment @env
        else
          modal.appendError result.error
          modal.stopProgress().setProgressStatus('error')

  install: (e) =>
    app = @get_app e

    if app.own_environment
      modal.confirmWindowsProcess().then =>
        @install_own_environment app
    else
      @app_operation app, 'install', 'App Install', install_template, 'installed'
      Setup.analyticsEvent "App", "Installed", app.appname

  install_own_environment: (app) ->
    env_name = make_own_env_name app.appname
    html = install_own_env_template
      name: app.appname
    modal.show 'App Install (Own Environment)', html
    modal.addProgress()

    conda.index().then (index) =>
      packages = [app.appname]

      # If the package is Py3 only, make sure to create an env with py3
      pkgs = index[app.appname]
      pkg = _.last pkgs
      pkgs = _.filter pkgs, (x) -> x.version is pkg.version
      python3only = _.all pkgs, (pkg) ->
        _.any pkg.depends, (dep) ->
          dep.slice(0, 8) is 'python 3'
      if python3only
        packages.push 'python=3'

      if _.has(@collections, env_name)
        operation = @collections[env_name].env.attributes.install
          packages: packages
          progress: true
          forcePscheck: true
      else
        operation = conda.Env.create
          packages: packages
          name: env_name
          progress: true
          forcePscheck: true

      modal.updateProgress(operation)
      operation.then (result) =>
        if result.success? and result.success
          modal.append "<p>#{app.appname} installed into own environment.</p>"
          modal.stopProgress().setProgressStatus('success')
          @trigger 'newEnvironment'
        else
          modal.appendError result.error
          modal.stopProgress().setProgressStatus('error')

  update: (e) =>
    app = @get_app e
    @app_operation app, 'update', 'App Update', update_template, 'updated'
    Setup.analyticsEvent "App", "Updated", app.appname

  _add: (model, environment, hideInstall, hideLaunch, hideOwnEnvironment, params={}) ->
    model = _.extend model,
      environment: environment
      hideInstall: hideInstall
      hideLaunch: hideLaunch
      hideOwnEnvironment: hideOwnEnvironment
      hasUpdate: model.hasUpdate? and model.hasUpdate

    html = item_template model
    el = $(html)
    if params.targetEl?
      params.targetEl.replaceWith(el)
      el.hide().fadeIn(400)
    else
      @$('.app-list').append el
      el.hide().fadeIn(100 + 400 * params.index)

  addOne: (model, index, list) =>
    hideInstall = ''
    hideLaunch = ''
    hideOwnEnvironment = 'hide'
    environment = @env.get('name')

    model.appid = index

    if model.installed
      hideInstall = 'hide'
    else
      hideLaunch = 'hide'

    if model.app_own_environment
      if model.installed
        model.ownEnvironment = false
        @_add model, environment, 'hide', '', 'hide',
          index: index

      own_env = make_own_env_name model.name
      if _.has(@collections, own_env)
        temporary = $('<li>')
        @$('.app-list').append temporary

        do (model, own_env, hideInstall, hideLaunch, hideOwnEnvironment, temporary) =>
          addOwnApp = (model) =>
            if model.installed
              hideInstall = 'hide'
              hideLaunch = ''
              model.ownEnvironment = true
            else
              hideInstall = ''
              hideLaunch = 'hide'
              hideOwnEnvironment = ''

            @_add model, own_env, hideInstall, hideLaunch, hideOwnEnvironment,
              targetEl: temporary

          if @collections[own_env].models.length is 0
            # Sync the app's own environment
            @collections[own_env].fetch()
            @collections[own_env].once 'sync', (collection, response) =>
              apps = response.apps
              model = response.apps[model.name]
              addOwnApp(model)
          else
            addOwnApp(@collections[own_env].models[0].get('apps')[model.name])

        return
      else
        hideOwnEnvironment = ''
        hideInstall = ''
        hideLaunch = 'hide'
        model.installed = false

    @_add model, environment, hideInstall, hideLaunch, hideOwnEnvironment,
      index: index

  addAll: (collection, response) =>
    @$('.app-list').fadeOut 400, -> $(this).html ''
    $('#loadingDiv').fadeOut 400, =>
      $('.error-no-apps').remove()
      Setup.analyticsEvent "Loading Screen", "Hidden"
      apps = response.apps
      if _.size(apps) > 0
        $('.app-list').show()
        _.each _.values(apps), @addOne
      else
        html = error_noapps()
        $('.app-panel-content').append(html)

  showLoading: ->
    $('#loadingDiv').fadeIn 400
    Setup.analyticsEvent "Loading Screen", "Showed"
    $('.app-list').hide().html ''
    $('.error-no-apps').remove()

  render: (env) ->
    @showLoading()
    for name, collection of @collections
      # Stop listening to events
      collection.off()

    if @collections[env]?
      apps = @collections[env]
      apps.on 'sync', @addAll
      apps.fetch()
    else
      # This shouldn't happen, but in case it does.
      console.log "Env #{env} does not exist."
      html = error_noapps()
      $('.app-panel-content').append(html)

  preload: (env) =>
    @collections[env.get('name')] = new AppCollection [],
      env: env

  activateEnvironment: (env) =>
    @env = env
    @render env.get('name')

    Setup.analyticsEvent "Environment", "Switched"

  reload: ->
    @showLoading()
    @collections[@env.get('name')].fetch(reload: true)

module.exports = AppView;
