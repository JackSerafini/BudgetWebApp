// File per gestire l'URL /api/users
const express = require("express");
const db = require("../db");
const verifyToken = require("./token-verif");
const router = express.Router();

// metodo asincrono per cercare l’utente che matcha la stringa query
router.get("/search", verifyToken, async (req, res) => {
  try {
    // otteniamo la stringa query dalla richiesta
    const query = req.query.q;
    // ci connettiamo al database, precisamente alla collection degli utenti
    const mongo = await db.connectToDatabase();
    const users = await mongo
      .collection("users")
      .find({
        // $regex permette di fare il match tra il valore del field e l'espressione regolare data
        username: { $regex: query, $options: "i" }, // "i" per l'opzione case-insensitive
      })
      .toArray();

    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Errore interno" });
  }
});

/* // Nel caso sia necessario eliminare degli utenti:
router.delete("/:username", verifyToken, async (req, res) => {
  try {
    const { username } = req.params;
    const mongo = await db.connectToDatabase();
    const result = await mongo.collection("users").deleteOne({
      username: username,
    });
    if (result.deletedCount > 0) {
      res.json({ msg: "Utente eliminato con successo" });
    } else {
      res.status(404).json({ msg: "Utente non trovato" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Errore interno" });
  }
}); */

module.exports = router;
