env_template = require 'views/envitem'
env_info_template = require 'views/envinfo'
env_new_template = require 'views/envnew'
env_clone_template = require 'views/envclone'
EnvsCollection = require 'controllers/envController'
envs = new EnvsCollection()

Setup = require 'lib/setup'
modal = require 'lib/modal'

conda = nodeRequire 'conda'

class EnvView extends Backbone.View
  el: $('#env-view')

  events:
    "click .environment": "activateEnvironment"
    "click .env-info": "envInfo"
    "click .version": "envInfo"
    "click .env-new": "envNew"
    "click .env-delete": "envDelete"
    "click .env-clone": "envClone"

  initialize: ->
    envs.on 'sync', @render
    envs.on 'sync', () => @trigger 'loaded'
    @reset()

    @active = 'root'
    @activeEnv = null

    @on 'activate', =>
      if @activeEnv.get('installed').python?
        python = @activeEnv.get('installed').python
        @$('.version').html "Python #{python.version}-#{python.build}"
      else
        @$('.version').html "&lt;no python installed&gt;"

      @$('.env-clone a span').text("Clone Environment \"#{@activeEnv.get('name')}\"")
      @$('.env-delete a span').text("Delete Environment \"#{@activeEnv.get('name')}\"")

  reset: =>
    envs.fetch
      loadRevisions: false
      loadLinked: false

  addOne: (env) =>
    name = env.get('name')
    if name.slice(0, 20) is '_app_own_environment'
      @trigger 'loadOne', env
      return

    if name.charAt(0) is '_'
      return

    el = $(env_template(env.attributes))
    if name is @active
      el.addClass('active')
    else
      el.removeClass('active')

    @$('.dropdown-menu').append el

    @trigger 'loadOne', env

  render: =>
    @$('.environment,.no-environment').remove()
    envs.sort()
    envs.models.forEach (env) =>
      @addOne env

    if envs.length is 1
      @$('.dropdown-menu').append('<li class="no-environment"><a href="#"><em>No other environments</em></a></li>')

  activateEnvironment: (e) =>
    name = $(e.currentTarget).find('a').text()

    @activate name

  activate: (name) ->
    @$('.environment').show().each (i, el) ->
      if $(el).find('a').text() is name
        $(el).addClass('active')
      else
        $(el).removeClass('active')

    env = envs.findWhere { name: name }

    @$('.environment-name').html(name)
    @active = name
    @activeEnv = env
    console.log 'activating', name

    if _.size(env.get('installed')) is 0
      console.log 'loading installed packages first'
      env.attributes.linked().then =>
        @trigger 'activate', env
    else
      console.log 'using cached installed packages'
      @trigger 'activate', env

  envInfo: =>
    if not @activeEnv?
      return

    # Refresh the installed packages info
    modal.show "Environment #{@activeEnv.get('name')}", "<p>Loading info...</p>"
    @activeEnv.attributes.linked().then =>
      html = env_info_template
        env: @activeEnv.attributes
        python: @activeEnv.get('installed').python
        installedCount: _.size @activeEnv.get('installed')
      modal.replace html

    Setup.analyticsEvent "Environment", "Looked At Info"

  envDelete: =>
    if not @activeEnv?
      return

    name = @activeEnv.get('name')

    if name is 'root'
      modal.show 'Cannot Delete Environment', '<p>Cannot delete root environment.</p>'
      return

    message = "Are you sure you want to delete environment #{name}?"
    if Setup.platform is 'win32'
      message += "<br/><br/>WARNING: Please close any Anaconda programs (such as IPython) before continuing, or else this operation may fail."

    modal.confirm('Confirm Delete Environment', message).then (result) =>
      if result is true
        Setup.analyticsEvent "Environment", "Deleted"
        @_envDelete()

  _envDelete: =>
    name = @activeEnv.get('name')
    modal.show "Deleting Environment #{name}", "<p>Deleting environment...</p>"
    @activeEnv.destroy
      forcePscheck: true  # Required for Windows
      success: (model, response) =>
        if response.success? and response.success
          modal.append "<p>Environment deleted.</p>"

          @render()
          @activate 'root'
        else
          modal.append "<p>Error deleting environment.</p>"
          if nodeRequire('os').platform() is 'win32'
            modal.append "<p><strong>Windows users: note that you cannot delete a clone of the root environment from within the launcher.</strong></p>"
          modal.appendError response.error

  envNew: =>
    if not @activeEnv?
      return

    # Should load instantly as conda.index() has been called before and is
    # cached by now
    conda.index({ spec: 'python' }).then (data) =>
      modal.hide()
      data = data['python']
      versions = []

      for pkg in data
        version = conda.Package.parseVersion pkg.version
        major_version = "#{version.parts[0]}.#{version.parts[1]}"
        if versions.indexOf(major_version) is -1
          versions.push major_version
      versions.sort()

      installed = envs.findWhere({ name: 'root' }).get('installed')
      if installed.python?
        version = conda.Package.parseVersion installed.python.version
        python_version = "#{version.parts[0]}.#{version.parts[1]}"
      else
        python_version = ''

      html = env_new_template
        versions: versions
        python_version: python_version
      el = $(html)

      modal.prompt('Create New Environment', html).then (data) =>
        Setup.analyticsEvent "Environment", "Created"
        promise = conda.Env.create
          name: data.envName
          packages: ['python=' + data.envPython.replace('-', '=')]
          progress: true
          forcePscheck: true  # Needed for Windows (shouldn't make a difference - new env entirely)

        @_envCreationProgress promise, data.envName

  envClone: =>
    html = env_clone_template()
    el = $(html)

    modal.prompt("Clone Environment #{@activeEnv.get 'name'}", html).then (data) =>
      Setup.analyticsEvent "Environment", "Cloned"
      promise = @activeEnv.attributes.clone
        name: data.envName
        progress: true
        forcePscheck: true

      @_envCreationProgress promise, data.envName

  _envCreationProgress: (promise, name) ->
    modal.show 'Creating environment', "<p>Creating environment #{name}...</p>"
    modal.addProgress()
    promise.progress (progress) ->
      percent = 100 * progress.progress / progress.maxval
      modal.setProgress percent, progress.name
    promise.then (data) =>
      if data.success? and data.success
        modal.stopProgress().setProgressStatus('success')
        modal.append '<p>Environment created.</p>'
        @$('.environment').remove()
        envs.reset()
        envs.fetch
          loadRevisions: false
          loadLinked: false

        @once 'loaded', =>
          @activate name
      else
        modal.stopProgress().setProgressStatus('error')
        modal.append "<p>Could not create environment:</p>"
        modal.appendError data.error


module.exports = EnvView
