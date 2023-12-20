import express from "express"
import experiencesRouter from "./experiencesRouter.js"
import { User } from "../models/users.js"
import checkJwt from "../middlewares/checkJwt.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import multer from "multer"

const profilesRouter = express.Router()

//Configuro Multer per poter caricare i file
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: function (req, file, callback) {
    if (["image/jpeg", "image/png"].includes(file.mimetype)) {
      callback(null, `${Date.now()}_${file.originalname}`) //fare con id req.params.id
    } else {
      const error = new Error("Please upload png or jpg")
      error.statusCode = 500
      callback(error)
    }
  },
})

const upload = multer({ storage })

profilesRouter.use("/:id/experiences", experiencesRouter)

profilesRouter

  //controllo se profilesRouter è UP
  .get("/health", (req, res) => {
    res.json({ message: "Profiles route is working!" })
  })

  //restituisco tutti i profili
  .get("/", async (req, res, next) => {
    try {
      const profiles = await User.find({}).select("-password -__v")
      res.status(200).json(profiles)
    } catch (err) {
      next(err)
    }
  })

  //questo GET ritorna le informazioni dell'utente se ha un token valido
  //Requisiti: token
  //checkJWT fornisce già l'utente
  .get("/me", checkJwt, async (req, res, next) => {
    try {
      res.status(200).json(req.user)
    } catch (err) {
      next(err)
    }
  })

  //questo psot serve ad effettuare il login con password ed email,
  //Requisiti: password ed email (funziona anche se c'è tutto il resto dell'oggetto)
  //Se tutto funziona correttamente da un token valido per 5 ore
  .post("/login", async (req, res, next) => {
    try {
      const { email, password } = req.body

      // trova l'utente tramite email
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // confronta la password fornita con quella hashata nel db
      const isPasswordCorrect = await bcrypt.compare(password, user.password)
      if (!isPasswordCorrect) {
        return res.status(401).json({ message: "Invalid credentials" })
      }

      // Genera un nuovo token JWT
      const token = jwt.sign({ userId: user._id }, process.env.MY_SECRET, {
        expiresIn: "5h", // Imposta un periodo di validità per il token
      })

      // Restituisce l'utente con il nuovo token
      res.status(200).json({ token })
    } catch (err) {
      next(err)
    }
  })

  //restituisco un singolo utente in base all'id (se esiste)
  //occhio che se avessi messo prima questo get, il get "/me" sarebbe stato interpretato come un id!!!
  .get("/:id", async (req, res, next) => {
    try {
      const { id } = req.params
      const user = await User.findById(id).select("-password -__v")

      if (!user) {
        return res.status(404).send()
      }

      res.json(user)
    } catch (error) {
      next(error)
    }
  })

  //questa patch carica l'immagine sul server in uploads e resistuisce la posizione dell'immagine
  .patch("/:id/image", checkJwt, upload.single("profile-img"), async (req, res, next) => {
    try {
      if (req.file) {
        console.log(req.file.path) // Stampa il percorso dove viene salvato il file
        res.status(200).json({ message: "Immagine caricata!", path: req.file.path })
      } else {
        res.status(400).json({ message: "No file uploaded" })
      }
    } catch (error) {
      next(error) // Passa eventuali errori al middleware di gestione degli errori
    }
  })

  //questo POST crea un nuovo utente, hasha la password, e resituisce subito il token (REGISTRAZIONE)
  //Requisiti body: name surname email password
  .post("/", async (req, res, next) => {
    try {
      const password = await bcrypt.hash(req.body.password, 10)

      const newUser = await User.create({
        ...req.body,
        password,
      })

      const token = jwt.sign({ userId: newUser._id }, process.env.MY_SECRET, {
        expiresIn: "2h",
      })

      const { password: _, __v, ...newUserWithoutPassword } = newUser.toObject()
      res.status(201).json({ user: newUserWithoutPassword, token })
    } catch (err) {
      next(err)
    }
  })

  //questa PUT modifica l'utente SE esso è autorizzato, tuttavia è necessario hashare nuovamente la pssw
  .put("/:id", checkJwt, async (req, res, next) => {
    try {
      //creo una variabile in modo tale da copiare la richiesta inserendo però la pssw hashata
      let updatedBodyHashed = req.body
      if (req.body.password) {
        updatedBodyHashed.password = await bcrypt.hash(req.body.password, 10)
      }

      const updatedUser = await User.findByIdAndUpdate(req.user._id, updatedBodyHashed, {
        new: true,
        runValidators: true,
      }).select("-__v -password")

      res.json(updatedUser)
    } catch (err) {
      next(err)
    }
  })

export default profilesRouter
