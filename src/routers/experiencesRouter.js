import express from "express"
import { Experience } from "../models/experiences.js"
import checkJwt from "../middlewares/checkJwt.js"
import compareIds from "../middlewares/compareIds.js"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { v2 as cloudinary } from "cloudinary"
import multer from "multer"

//mergeParams mi consente di usare :id del router profiles
//HO PERSO UN'ORA PER QUESTO
const experiencesRouter = express.Router({ mergeParams: true })

//Configuro Cloudinary per poter caricare i file
cloudinary.config()
const cloudstorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blogfolder",
  },
})

const upload = multer({ storage: cloudstorage })

//routes del tipo .../api/profiles/:id/experiences/...
experiencesRouter

  //questo get mi restituisce TUTTE le esperienze di tutti
  .get("/", async (req, res, next) => {
    try {
      const userId = req.params.id // Ottengo l'id dell'utente dai parametri dell'URL

      // Eseguo una query per trovare tutte le esperienze associate all'ID dell'utente
      // Forse conveniva racchiudere tutte le esperienze all'interno di una chiave di un profilo?
      const experiences = await Experience.find({ user: userId }).select("-username -__v")

      res.json(experiences)
    } catch (error) {
      next(error)
    }
  })
  //questo POST permetta all'utente con un token valido di creare una nuova esperienza
  //l'id dell'utente viene recuperato dal mdw checkJwt invece che dall'URL
  .post("/", checkJwt, compareIds, async (req, res, next) => {
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

  //questo GET ritorna un'esperienza in particolare dell'utente identificato dal token
  .get("/:expId", checkJwt, compareIds, async (req, res, next) => {
    try {
      const { expId } = req.params
      const experience = await Experience.findById(expId)

      if (!experience) {
        return res.status(404).json({ messaggio: "Esperienza non trovata" })
      }
      res.status(200).json(experience)
    } catch (err) {
      next(err)
    }
  })

  //questa PUT modifica una esperienza in particolare se l'utente ha un token valido
  //ATTENZIONE!!
  //tuttavia se un utente con un token valido non è il proprietario è un casino, quindi serve un controllo in più
  .put("/:expId", checkJwt, compareIds, async (req, res, next) => {
    try {
      const { expId } = req.params
      const userIdFromToken = req.user._id.toString() // serve il cast perchè è un IdObject
      const { id } = req.params

      console.log(userIdFromToken, id)

      if (userIdFromToken !== id) {
        return res.status(403).send({ message: "Non sei il proprietario di questi dati!" })
      }
      const modifiedExp = await Experience.findByIdAndUpdate(expId, req.body, { new: true })

      if (!modifiedExp) {
        return res.status(404).json({ messaggio: "Esperienza non trovata" })
      }

      await modifiedExp.save()

      res.status(200).json(modifiedExp)
    } catch (err) {
      next(err)
    }
  })

  .delete("/:exp", checkJwt, compareIds, async (req, res, next) => {
    try {
      const { exp } = req.params
      // console.log(id)
      const deletedDoc = await Experience.findByIdAndDelete(exp)
      if (!deletedDoc) {
        res.status(404).send()
      } else {
        res.status(204).send()
      }
    } catch (err) {
      next(err)
    }
  })
  //questa PATCH manda un immagine su cloudinary e modifica il valore image dell'esperienza
  .patch("/:expId/image", checkJwt, compareIds, upload.single("experience-img"), async (req, res, next) => {
    try {
      const { expId } = req.params
      if (req.file) {
        const updatedImage = await Experience.findByIdAndUpdate(expId, { image: req.file.path }, { new: true })
        console.log(req.file.path) // Stampa il percorso dove viene salvato il file
        res.status(200).json(updatedImage)
      } else {
        res.status(400).json({ message: "No file uploaded" })
      }
    } catch (err) {
      next(err)
    }
  })

export default experiencesRouter
