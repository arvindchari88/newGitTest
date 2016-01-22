conda = nodeRequire('conda')

module.exports =
  platform: nodeRequire('os').platform()

  getVersionInfo: ->
    conda.info().then (info) ->
      return {
        version: "1.0.0"
        shell_version: process.versions['node-webkit']
        conda_version: info['conda_version']
        }

  getCondaInfo: conda.info

  configAnalytics: (enabled=null) ->
    if enabled?
      # Stores setting in localStorage.
      window.localStorage['analytics'] = enabled
      window['ga-disable-UA-27761864-8'] = !enabled
    else if window.localStorage['analytics']? and window.localStorage['analytics'] is 'true'
      return true
    else
      return false

  firstRun: ->
    not (window.localStorage['firstRun']? and window.localStorage['firstRun'])

  askAnalytics: ->
    window.localStorage['firstRun'] = false
    $('#analytics-prompt').show()
    $('#analytics-prompt .opt-in').click =>
      @configAnalytics true
      $('#analytics-prompt').alert('close')

      $('#analytics-thanks').fadeIn()
      $('#analytics-thanks').delay(2000).fadeOut()

    $('#analytics-prompt .decline').click =>
      @configAnalytics false
      $('#analytics-prompt').alert('close')

    $('#analytics-prompt .more-info').click =>
      @aboutAnalytics()

  aboutAnalytics: ->
    modal = require 'lib/modal'
    analytics_info_template = require 'views/analyticsinfo'
    modal.show 'About Analytics', analytics_info_template()

  analyticsEvent: (category, action, label='') ->
    if @configAnalytics()
      if window.ga
        console.log "Sending analytics event", category, action, label
        window.ga 'send',
          hitType: 'event'
          eventCategory: category
          eventAction: action
          eventLabel: label
