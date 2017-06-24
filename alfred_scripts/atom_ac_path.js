const _    = require('lodash')
const fs   = require('fs')
const XML  = require('xml')
const path = require('path')

const filepaths = [
  ['home directory', path.join(__dirname, '..')],
  ['public repos',   path.join(__dirname, '..', 'public_repos')],
  ['main projects',  path.join(__dirname, '..', 'trunkclub')],
  ['go projects',    path.join(__dirname, '..', 'trunkclub', 'go', 'src', 'github.com', 'trunkclub')],
]

const search        = process.argv[2]
const searchPattern = new RegExp('^' + search, 'ig')
const searchResults = _.flatten(filepaths.map((args) => {
  const groupName = args[0]
  const filepath  = args[1]

  return fs.readdirSync(filepath).map((result) => {
    var file    = result.toString()
    return {
      name         : file,
      stats        : fs.statSync(path.join(filepath, file)),
      folder       : path.join(filepath, file),
      groupName    : groupName,
      patternMatch : !!file.match(searchPattern),
    }
  })
  .filter((result) => {
    return result.patternMatch && result.stats.isDirectory()
  })
}))

const sorted = _.sortBy(searchResults, (result) => -result.stats.ctime)

const items = sorted.map((result) => {
  return {
    item: [
      { _attr    : { uid: result.folder, arg: result.folder, valid: 'yes' } },
      { title    : result.name },
      { subtitle : result.groupName }
    ]
  }
})

const xml = XML({items: items}, { declaration: true })
process.stdout.write(xml)
