import express from "express"

const experiencesRouter = express.Router()

experiencesRouter.get("/health", (req, res) => {
  res.json({ message: "Experiences router is working!" })
})

export default experiencesRouter
