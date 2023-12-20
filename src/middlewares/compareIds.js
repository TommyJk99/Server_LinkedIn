const compareIds = async (req, res, next) => {
  try {
    //req.user._id arriva da checkJwt
    const userIdFromToken = req.user._id.toString() // serve il cast perchè è un IdObject
    const { id } = req.params //nei parametri che ho :id ma eventualmente potrei estendere anche ad altri

    if (userIdFromToken !== id) {
      return res
        .status(403)
        .json({ message: "Cosa ci fai qui?? L'Id del tuo Token ed il token dell'URL non combaciano!" })
    }

    next()
  } catch (err) {
    next(err)
  }
}

export default compareIds
