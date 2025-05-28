import express from "express"
import bodyParser from "body-parser"
import qr from "qr-image"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const app = express()
const port = 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))

app.get("/", (req, res) => {
  res.render("index", { imageGenerated: false, url: "" })
})

app.post("/generate", (req, res) => {
  const url = req.body.url
  if (!url) {
    return res.render("index", {
      imageGenerated: false,
      url: "",
      error: "Please enter a valid URL",
    })
  }

  try {
    const qr_svg = qr.image(url, {
      type: "png",
      size: 10,
      margin: 2,
      ec_level: "M",
    })
    const filePath = path.join(__dirname, "public", "qr-image.png")
    qr_svg.pipe(fs.createWriteStream(filePath))

    res.render("index", {
      imageGenerated: true,
      url: url,
      error: null,
    })
  } catch (error) {
    res.render("index", {
      imageGenerated: false,
      url: url,
      error: "Failed to generate QR code",
    })
  }
})

app.get("/download", (req, res) => {
  const url = req.query.url

  if (!url) {
    return res.status(400).send("URL is required")
  }

  try {
    const qr_svg = qr.image(url, {
      type: "png",
      size: 12,
      margin: 2,
      ec_level: "H",
    })

    res.setHeader("Content-Disposition", 'attachment; filename="qr-code.png"')
    res.setHeader("Content-Type", "image/png")

    qr_svg.pipe(res)
  } catch (error) {
    res.status(500).send("Error generating QR code for download")
  }
})

app.listen(port, () => {
  console.log(`QR Code Generator running at http://localhost:${port}`)
})
