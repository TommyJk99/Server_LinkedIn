import { mongoose, Schema } from "mongoose"

//modello utente stile striveschool
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: function () {
      return this.googleId ? false : true
    }, //se googleId è presente non richiede la password se no la richiede
  },
  username: {
    type: String,
    default: "",
  },

  title: {
    type: String,
    default: "",
  },
  bio: {
    type: String,
    default: "",
  },
  area: {
    type: String,
    default: "",
  },
  image: {
    type: String,
    default: "",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  googleId: {
    type: String,
    required: function () {
      return this.password ? false : true
    }, //se password è presente non richiede il googleId se no lo richiede
  },
})

export const User = mongoose.model("Users", userSchema, "users")
