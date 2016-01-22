gui = nodeRequire 'nw.gui'
Setup = require 'lib/setup'

class SidebarView extends Backbone.View
  el: $("#sidebar")

  events:
    "click .sidelink": "openlink"

  openlink: (e) =>
    # Open in the default browser
    gui.Shell.openExternal e.currentTarget.href
    Setup.analyticsEvent "Sidebar Link", "Opened", e.currentTarget.href
    return false

module.exports = SidebarView
