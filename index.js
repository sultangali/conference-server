import express from 'express'

import mongoose from 'mongoose'
import config from 'config'
import cors from 'cors'
import "./service/emailScheduler.js";
import userRouter from './route/user.routes.js'
import uploadRouter from './route/upload.routes.js'
import articleRouter from './route/article.routes.js'

const app = express()
 
const PORT = config.get('port')

app.use(express.json())

app.use('/upload', express.static('upload'))
app.use('/images', express.static('images'))

app.use(cors(
//     {
//     origin: 'http://localhost:5000'
// }
)) 
  

const start = async () => {
    try {
        await mongoose.set('strictQuery', true)
        await mongoose.set('strictPopulate', false)
        await mongoose.connect(config.get('dbUrl'))
        console.log(`database OK\tname: ${mongoose.connection.name}`)
    } catch (error) {
        console.log(`database ERROR: ${error.message}`)
    }
  
    app.use('/api/upload', uploadRouter)
    app.use('/api/user', userRouter)
    app.use('/api/articles', articleRouter)
 
    app.listen(PORT, (error) => {
        if(error) {
            console.log(`server ERROR`)
        }  
        console.log(`server OK\tport: ${PORT}`)
    })
}
   
start()