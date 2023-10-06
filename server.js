const express = require('express')
const morgan = require('morgan')
const mongoose = require('mongoose')
const config = require('./config/database')
const api = require('./routes/api');
const passport = require('passport');
const cors = require('cors')
const bodyParser = require('body-parser')

mongoose.connect(config.dataabse, { useUnifiedTopology: true, useNewUrlParser: true })
        .then(() => console.log('Database connected'))
        .catch(err => console.log(err));

require('dotenv').config()
const PORT = process.env.PORT || 3001


const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
app.use(passport.initialize())

app.get('/', (req, res, next) => {
    res.send('Express')
})

app.use('/api', api)

app.listen(PORT, () => {
    console.log(`This app is running at ${PORT}`)
})