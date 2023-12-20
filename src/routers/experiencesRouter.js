import express from "express"
import { Experience } from "../models/experiences.js"
import checkJwt from "../middlewares/checkJwt.js"

//mergeParams mi consente di usare :id del router profiles
//HO PERSO UN'ORA PER QUESTO
const experiencesRouter = express.Router({ mergeParams: true })

//routes del tipo .../api/profiles/:id/experiences/...
experiencesRouter

  //questo get mi restituisce TUTTE le esperienze di tutti
  .get("/", async (req, res, next) => {
    try {
      const userId = req.params.id // Ottengo l'id dell'utente dai parametri dell'URL
      console.log(userId)

      // Eseguo una query per trovare tutte le esperienze associate all'ID dell'utente
      // Forse conveniva racchiudere tutte le esperienze all'interno di una chiave di un profilo?
      const experiences = await Experience.find({ user: userId }).select("-username -__v")

      res.json(experiences)
    } catch (error) {
      next(error)
    }
  })
  //questo post permetta all'utente con un token valido di creare una nuova esperienza
  //l'id dell'utente viene recuperato dal mdw checkJwt invece che dall'URL
  .post("/", checkJwt, async (req, res, next) => {
    try {
      const userId = req.user._id
      const experienceData = { ...req.body, user: userId } //sovrascrivo user in caso venisse inserito
      const newExperience = new Experience(experienceData)

      await newExperience.save()

      res.status(201).json(newExperience)
    } catch (err) {
      next(err)
    }
  })

export default experiencesRouter
