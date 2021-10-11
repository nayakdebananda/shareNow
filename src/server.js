const express = require('express')
const app = express()
const PORT = 2001
const qr = require('qrcode')
const fs = require('fs')
const fileUpload = require('express-fileupload')
const url = require('url')
const path = require('path')
const os = require('os')
const ip = os
  .networkInterfaces()
  ['Wi-Fi'].find(ip => ip.family == 'IPv4').address

const address = `http://${ip}:${PORT}/`
const tempPath = url.pathToFileURL(os.tmpdir()).pathname.replace('/', '')
const fileSharePath = tempPath + '/uploads/'
if (!fs.existsSync(fileSharePath)) {
  fs.mkdirSync(fileSharePath)
} else {
  fs.rmSync(fileSharePath, { recursive: true })
  fs.mkdirSync(fileSharePath)
}
app.use(fileUpload())
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
qr.toFile(
  __dirname + '/public/qr.png',
  address,
  { color: { dark: '#373941', light: '#cae3f1' } },
  err => {
    if (err) {
      console.error(err)
    }
  }
)

app.get('/', (req, res) => {
  var files = fs.readdirSync(fileSharePath)
  res.render('index', { files: files, path: fileSharePath })
})

app.get('/download/:fileName', (req, res) => {
  res.download(fileSharePath + req.params.fileName)
})

app.get('/upload', (req, res) => {
  res.render('upload')
})

app.post('/upload', (req, res, next) => {
  if (!req.files) return
  let files = req.files.foo
  if (files.length > 1) {
    files.map(file => {
      file.mv(fileSharePath + file.name, err => {
        if (err) {
          res.send(err)
        }
      })
    })
  } else {
    files.mv(fileSharePath + files.name, err => {
      if (err) {
        res.send(err)
      }
    })
  }
  res.redirect('/qrcode')
})

app.get('/qrcode', (req, res) => {
  res.render('qrcode', { portInfo: address })
})

app.listen(PORT)
