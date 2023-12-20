export const genericError = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || "Errore interno del server😒"

  if (err.name === "ValidationError") {
    // Gestione degli errori di validazione
    statusCode = 400
    message = "Errore di validazione 🙉"
  }

  if (err.name === "UnauthorizedError") {
    // Gestione degli errori di autenticazione JWT
    statusCode = 401
    message = "Non autorizzato ⛔"
  }

  if (err.name === "CustomError") {
    // Gestione di un errore personalizzato con un codice di stato specifico
    statusCode = err.statusCode || 500
    message = err.message || "Qualcosa è andato storto 🤕"
  }

  console.error("\n", err.name, " ⤵️", "\n", err)

  res.status(statusCode).json({ error: message })
}
