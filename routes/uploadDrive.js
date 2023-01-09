const express = require("express")
const uniqid = require("uniqid")
const router = express.Router()

const {decodeToken} = require("../scripts/jwt")

router.post("/", async (req, res, next) => {
    const {files, body, headers} = req

    if (!files) res.send({
        status: false,
        message: "No file uploaded",
    })

    // if (headers.authorization)
    //   const {id} = decodeToken(headers.authorization)

    const name = body.name && body.name !== 'null' ? body.name : uniqid()
    const {img} = files
    const {mimetype, size} = img

    let extension = "", dirname = '.'
    switch (mimetype) {
        case "application/pdf":
            extension = "pdf"
            await img.mv(`${dirname}/public/images/${body.type}/${name}.${extension}`)
            break
        case "image/png":
            extension = "png"
        case "image/jpeg":
            extension = extension !== '' ? extension : "jpeg"
            await img.mv(`${dirname}/public/images/${body.type}/${name}.${extension}`)
            break
        case 'application/msword':
            extension = 'doc'
            await img.mv(`${dirname}/public/images/${body.type}/${name}.${extension}`)
            break
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            extension = 'docx'
            await img.mv(`${dirname}/public/images/${body.type}/${name}.${extension}`)
            break
        case "text/plain":
            extension = 'txt'
            await img.mv(`${dirname}/public/images/${body.type}/${name}.${extension}`)
            break
    }

    res.send({
        status: true,
        message: "File is uploaded",
        data: {
            name: `${name}.${extension}`,
            mimetype,
            size
        }
    })
})

module.exports = router