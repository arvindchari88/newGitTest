conda = nodeRequire 'conda'

Setup = require 'lib/setup'
modal = require 'lib/modal'

channel_template = require 'views/channel'
channel_item_template = require 'views/channelitem'


class ChannelView extends Backbone.View
  el: $('#manage_channels')

  events:
    "click .manage": "show"

  initialize: (options) =>
    super(options)
    @config = new conda.Config()

  show: =>
    Setup.analyticsEvent "Channel Manager", "Opened"
    @config.get('channels').then (channels) =>
      if not channels.set
        channels = ['defaults']
      else
        channels = channels.value

      @original = channels.slice()
      @channels = channels

      @render()

  render: ->
    modal.prompt('Manage Conda Channels', '').then @save

    @rerender()

  rerender: ->
    html = channel_template
      channels: @channels
      template: channel_item_template
    modal.replace html, 'prompt'

    $('#prompt_modal #add-channel').focus()

    addChannel = (channel, button) =>
      if not channel or @channels.indexOf(channel) isnt -1
        button.parent().parent().addClass('error').find('.help-inline').show()
      else
        button.parent().parent().removeClass('error').find('.help-inline').hide()

        @channels.push(channel)
        @rerender()

    $('#prompt_modal #add').click (e) ->
      addChannel($(e.target).prev().val(), $(e.target))
    $('#prompt_modal #add-channel').keyup (e) ->
      if e.keyCode is 13
        addChannel($(e.target).val(), $(e.target).next())

    $('#prompt_modal .remove').click (e) =>
      channel = $(e.target).prev().val()
      @channels = _.filter(@channels, ((x) -> x isnt channel))

      $(e.target).parent().remove()

    $('#prompt_modal a.external').click (e) =>
      gui = global.window.nwDispatcher.requireNwGui()
      gui.Shell.openExternal e.currentTarget.href
      return false

  save: =>
    removed = []
    added = []
    for channel in @channels
      if @original.indexOf(channel) is -1
        added.push(channel)

    for channel in @original
      if @channels.indexOf(channel) is -1
        removed.push(channel)

    promises = []

    for channel in removed
      Setup.analyticsEvent "Channel", "Removed"
      promises.push @config.remove('channels', channel)

    for channel in added
      Setup.analyticsEvent "Channel", "Added"
      promises.push @config.add('channels', channel)

    Promise.all(promises).then =>
      console.log "Saved settings"
      @trigger 'changeChannels'

module.exports = ChannelView
