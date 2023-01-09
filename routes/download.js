const express = require("express")
const router = express.Router()

router.get('/', async (req, res, next) => {
    res.download(req._parsedUrl.query)
})

module.exports = router