import mongoose from "mongoose"

const { Schema } = mongoose

const experienceSchema = new Schema(
  {
    role: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },

    description: String,

    area: String,

    username: String,

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    image: String,
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
)

const Experience = mongoose.model("Experience", experienceSchema)

export default Experience
