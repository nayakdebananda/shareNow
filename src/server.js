const express = require('express')
const app = express()
const PORT = 2001
const fs = require('fs')
const fileUpload = require('express-fileupload')
const url = require('url')
const path = require('path')
const os = require('os')
const ip = os.networkInterfaces()['Wi-Fi'][3].address

const address = `http://${ip}:${PORT}/`
const tempPath = url.pathToFileURL(os.tmpdir()).pathname.replace('/', '')
const fileSharePath = tempPath + '/uploads/'
app.use(fileUpload())
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/views'))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))

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
  const qrcode = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${address}&choe=UTF-8`
  res.render('qrcode', { code: qrcode, portInfo: address })
})

app.listen(PORT)
