import express from "express"
import list from "express-list-endpoints"
import mongoose from "mongoose"
import cors from "cors"
import apiRouter from "./routers/apiRouter.js"
import { genericError } from "./middlewares/genericError.js"

const server = express()

server.use(cors())

const port = process.env.PORT || 3030
server.use(express.json())

/*ROUTES
api/profiles/:userId/experiences/:expId
api/profiles/:userId/picture
api/profiles/:userId/experiences/:expId/picture
*/

server.use("/api", apiRouter)

//serve a vedere se il server è UP
server.get("/health", (req, res) => {
  res.status(200).json({ message: "server up!" })
})

//Middleware di errore generico
server.use(genericError)

mongoose.connect(process.env.MONGO_URL).then(() => {
  server.listen(port, () => {
    console.log("😊 Server listening at port:", port)
    console.table(list(server))
  })
})
