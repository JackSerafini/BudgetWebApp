// File per la verifica dei token
const jwt = require("jsonwebtoken");
const JWT_SECRET = "your_jwt_secret"; // stringa che deve fare il match con quella dell'autenticazione utente

const verifyToken = async (req, res, next) => {
  // prendiamo il token dai cookies
  const token = req.cookies["token"];
  if (!token) {
    res.status(403).json({ msg: "Autenticazione fallita" });
    return;
  }
  // altrimenti proviamo a decodificarlo
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // salviamo l'userID e lo username di chi fa la richiesta
    req.userId = decoded._id;
    req.username = decoded.username;

    next(); // essendo un middleware, chiama il metodo successivo
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ msg: "Token scaduto" });
    } else {
      res.status(401).json({ msg: "Non autorizzato" });
    }
  }
};

module.exports = verifyToken;
