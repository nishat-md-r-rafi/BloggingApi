const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const auth = require('./routes/auth')
const post = require('./routes/posts')
const category = require('./routes/category')
const user = require('./routes/user')
const cors = require('cors')
const config = require('config') 

dotenv.config({ path: "./.env" })
const app = express();
const PORT = 5000 || process.env.PORT

// console.log(`application url : ${config.get("URL")}`)



mongoose.connect(config.get("URL"))
                    .then(()=>{console.log("MongoDB is connected")})
                    .catch((err) => {console.log(err)})

app.get('/', (req, res) => {
    res.send("Blogging API is connected!!")
})


app.use(cors())
app.use(express.json())
app.use('/api/auth', auth)
app.use('/api/post', post)
app.use('/api/category', category)
app.use('/api/user', user)
app.listen(PORT, ()=>{
    console.log('listening on port', PORT);
})