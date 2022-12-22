const fs = require('fs')

module.exports.getContractAddresses = function(path) {
  let cd = path;
  if(typeof path === "undefined") {
    cd = `${process.cwd()}/`
  }

  return JSON.parse(fs.readFileSync(cd + "contractAddresses.json").toString())
}

module.exports.writeContractAddresses = function(contractAddresses) {
  fs.writeFileSync(
    `${process.cwd()}/contractAddresses.json`,
    JSON.stringify(contractAddresses, null, 2) // Indent 2 spaces
  )
}
