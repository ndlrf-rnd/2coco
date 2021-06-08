const crypto = require('crypto')
const fs = require('fs')

const DEFAULT_ALGORITHM = 'sha1'

const getFileHash = (filePath, algorithm=DEFAULT_ALGORITHM) => new Promise(
  (resolve, reject) => {

    const shasum = crypto.createHash(algorithm)

    // Updating shasum with file content
    // var filename = __dirname + "/anything.txt"
    const s = fs.ReadStream(filePath)
    s.on('data', (data) => {
      shasum.update(data)
    })
    s.on('error', reject)
    // making digest
    s.on('end', () => {
        resolve(shasum.digest('hex'))
      }
    )
  }
)

module.exports={
  getFileHash
}
