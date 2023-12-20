import express from "express"
import profilesRouter from "./profilesRouter.js"

const apiRouter = express.Router()

apiRouter.use("/profiles", profilesRouter)

apiRouter.get("/health", (req, res) => {
  res.json({ message: "Api route is working!" })
})

export default apiRouter
