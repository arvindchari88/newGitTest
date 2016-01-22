Env = require 'models/env'
conda = nodeRequire 'conda'

convert = (text) ->
  if text.match /\d+/
    parseInt text, 10
  else
    text

key = (text) ->
  text.split(/(\d+)/).map(convert).filter (x) -> x isnt ""

naturalSortComparator = (a, b) ->
  if a.get('name') is 'root'
    return -1
  if b.get('name') is 'root'
    return 1
  a = key(a.get('name'))
  b = key(b.get('name'))

  for pair in _.zip a, b
    aElem = pair[0]
    bElem = pair[1]

    if not aElem?
      return -1
    if not bElem?
      return 1

    if aElem is bElem
      continue

    if _.isNumber aElem and not _.isNumber bElem
      return 1
    else if _.isNumber bElem and not _.isNumber aElem
      return -1

    if aElem > bElem
      return 1
    else
      return -1

  return 0

EnvsCollection = Backbone.Collection.extend
  model: Env
  sync: conda.Env.backboneSync
  comparator: naturalSortComparator

module.exports = EnvsCollection
