import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { User } from "../../models/users.js"

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://linkedin-clone-wdpt03-m6bw.netlify.app/api/profiles/oauth-callback",
  },
  async function (_, __, profile, cb) {
    console.log(profile)
    let user = await User.findOne({ googleId: profile.id })

    if (!user) {
      user = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        surname: profile.name.familyName || "N/A",
        username: profile.displayName,
        image: profile.photos[0].value,
      })
    }
    cb(null, user)
  }
)

export default googleStrategy
