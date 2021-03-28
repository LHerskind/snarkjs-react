const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.static('./../zkproof'));
app.listen(8000, () => console.log('Serving at http://localhost:8000!'))