Setup = require 'lib/setup'

module.exports = ->
  console.log 'ready'

  AppView = require 'apps'
  EnvView = require 'envs'
  InfoView = require 'info'
  ChannelView = require 'channels'
  SidebarView = require 'sidebar'

  apps = new AppView
  envs = new EnvView
  info = new InfoView
  channels = new ChannelView
  sidebar = new SidebarView

  envs.on 'activate', apps.activateEnvironment
  envs.on 'loadOne', (env) ->
    apps.preload env
  envs.on 'loaded', ->
    envs.activate 'root'
  apps.on 'newEnvironment', ->
    current = apps.env.get('name')
    envs.reset()
    envs.off 'loaded'
    envs.once 'loaded', ->
      envs.activate current
  channels.on 'changeChannels', ->
    apps.reload()
    apps.collections.forEach (collection, env_name, collections) ->
      if env_name.slice(0, 20) is "_app_own_environment"
        # Check for updates in hidden own_app environments as well
        collection.fetch()

  # get launcher info
  Setup.getVersionInfo().then (info) ->
    $('#launcher_version').empty().append info.version
    conda = window.nodeRequire 'conda'
    installed =
      version: info.conda_version
      build_number: 0
    required =
      version: '3.6.0'
      build_number: 0

    try
      conda.Package.parseVersion installed.version
    catch ex
      # Version string we can't parse (e.g. unknown or a git hash)
      return

    if not conda.Package.isGreater(required, installed) and info.conda_version.slice(0, 5) isnt '3.6.0'
      version_error_template = require 'views/error_conda'
      html = version_error_template
        installed: installed
        required: required
      $('.app-panel-content').html(html)
      envs.remove()

  if Setup.firstRun()
    Setup.askAnalytics()
