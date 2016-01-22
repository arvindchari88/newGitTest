Setup = require 'lib/setup'

module.exports =
  show: (title, html) ->
    $('#general_modal .modal-title').empty().append title
    $('#general_modal .modal-body').empty().append html
    $('#general_modal').modal('show')

  error: (title, text, error) ->
    @show title, $("<p>#{text}</p> <p class=\"alert alert-error preserve-whitespace\">#{error}</p>")

  hide: ->
    $('#general_modal').modal('hide')

  replace: (html, modal='general') ->
    $("##{modal}_modal .modal-body").empty().append html

  append: (html) ->
    $('#general_modal .modal-body').append html

  appendError: (error) ->
    @append $("<p class=\"alert alert-error preserve-whitespace\">#{error}</p>")

  addProgress: ->
    @append '<div class="progress progress-striped active">
      <div class="bar" style="width: 0%;"></div>
    </div>'

  setProgress: (percent, message='') ->
    $('#general_modal .bar').css 'width', "#{percent}%"
    $('#general_modal .bar').html message
    return this

  setProgressStatus: (status) ->
    $('#general_modal .bar').addClass("bar-#{status}")
    return this

  stopProgress: ->
    $('#general_modal .progress').removeClass('active')
    return this

  updateProgress: (operation) ->
    operation.progress (progress) =>
      message = ''
      if progress.fetch?
        message = 'Fetching ' + progress.fetch
      if progress.name?
        message = 'Linking ' + progress.name
      percent = 100 * progress.progress / progress.maxval
      @setProgress percent, message

  confirm: (title, message) ->
    $('#confirm_modal .modal-title').empty().append title
    $('#confirm_modal .modal-body').empty().append "<p>#{message}</p>"
    $('#confirm_modal').modal('show')

    return new Promise (fulfill, reject) ->
      $('#confirm_modal .submit').one 'click', ->
        $('#confirm_modal').modal('hide')
        fulfill(true)

      $('#confirm_modal .cancel').one 'click', ->
        $('#confirm_modal').modal('hide')
        fulfill(false)

  prompt: (title, html) ->
    $('#prompt_modal .modal-title').empty().append title
    $('#prompt_modal .modal-body').empty().append html
    $('#prompt_modal').modal('show')

    return new Promise (fulfill, reject) ->
      $('#prompt_modal .submit').click ->
        data = {}
        valid = true
        $('#prompt_modal .required').each ->
          value = $(this).val()
          field = $(this).attr('id')

          if not value
            valid = false
            $(this).closest('.control-group').addClass('error')
          else
            $(this).closest('.control-group').removeClass('error')

          data[field] = value

        if valid
          $('#prompt_modal').modal('hide')
          fulfill(data)

  confirmWindowsProcess: (callback) ->
    if Setup.platform isnt 'win32'
      return Promise.resolve(null)

    confirmation = @confirm 'Continue?', 'Please close any Anaconda programs (such as IPython) before continuing, else this operation may fail. Additionally, some operations may not be possible from within the launcher&mdash;please try the conda command-line interface instead in case of failure.'
    return new Promise (fulfill, reject) ->
      confirmation.then (response) =>
        if response
          fulfill()
        else
          reject()
