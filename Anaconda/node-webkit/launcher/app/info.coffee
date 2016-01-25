Setup = require 'lib/setup'
modal = require 'lib/modal'

launcher_info_template = require 'views/launcher_info'

class InfoView extends Backbone.View
  el: $('#launcher_info')

  events:
    "click  #launcher_version": "show"

  initialize: (options) =>
    super(options)

    @cached_launcher_info = null

    # Handle the About menu entry in OSX
    if nodeRequire('os').platform() is 'darwin'
      gui = global.window.nwDispatcher.requireNwGui()
      menu = new gui.Menu
        type: 'menubar'
      menu.createMacBuiltin "Anaconda Launcher"
      appmenu = menu.items[0].submenu
      appmenu.removeAt 0
      appmenu.insert new gui.MenuItem
          label: 'About Anaconda Launcher',
          click: =>
            Setup.analyticsEvent "Mac About Menu Entry", "Clicked"
            @show()
      , 0
      gui.Window.get().menu = menu

    @promise = Promise.all([Setup.getVersionInfo(), Setup.getCondaInfo()]).then (data) =>
      versioninfo = data[0]
      condainfo = data[1]

      versioninfo.conda = condainfo
      @cached_launcher_info = versioninfo

  show: =>
    if not @cached_launcher_info?
      @promise.then @show
    else
      Setup.analyticsEvent "Launcher Info", "Viewed"
      @cached_launcher_info['analytics'] = Setup.configAnalytics()
      el = $(launcher_info_template @cached_launcher_info)
      modal.show 'Anaconda Launcher Info', el

      $('#general_modal #analytics').change ->
        Setup.configAnalytics $(this).prop('checked')
      $('#general_modal .more-info').click ->
        Setup.aboutAnalytics()

module.exports = InfoView
