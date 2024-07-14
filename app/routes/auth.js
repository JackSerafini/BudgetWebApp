// File per l'autenticazione
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // modulo per encriptare le password
const db = require("../db");
const router = express.Router();

const JWT_SECRET = "your_jwt_secret"; // stringa che deve fare il match con quella della verifica del token

// metodo asincrono per registrare un utente
router.post("/signup", async (req, res) => {
  try {
    // recuperiamo tutti i dati dal body della request
    const { username, password, name, surname } = req.body;
    // ci connettiamo al database, precisamente alla collection degli utenti
    const mongo = await db.connectToDatabase();
    const user = await mongo.collection("users").findOne({ username });
    console.log(user);
    if (user) {
      return res.status(409).json({ msg: "Utente già esistente" });
    }
    // encriptiamo la password in una stringa alfanumerica
    const hashedPass = await bcrypt.hash(password, 10);
    // creiamo il nuovo utente
    const newUser = { username, password: hashedPass, name, surname };
    // e lo aggiungiamo alla collection
    const result = await mongo.collection("users").insertOne(newUser);
    // usiamo la proprietà insertedId per ottenere l'ID appena creato dal db
    const data = { _id: result.insertedId, username: newUser.username };
    // creo il token con jwt (sign per firmare)
    const token = jwt.sign(data, JWT_SECRET, { expiresIn: 86400 }); // 24 ore
    // lasciamo che si occupi il browser di gestire il token con i cookies
    res.cookie("token", token, { httpOnly: true });
    res.json({ msg: "Utente creato con successo" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Errore interno" });
  }
});

// metodo asincrono per loggare un utente
router.post("/signin", async (req, res) => {
  try {
    // recuperiamo username e password inviati dall'utente
    const { username, password } = req.body;
    // ci connettiamo al database, precisamente alla collection degli utenti
    const mongo = await db.connectToDatabase();
    const user = await mongo.collection("users").findOne({ username });
    console.log(user);
    if (user && (await bcrypt.compare(password, user.password))) {
      const data = { _id: user._id.toString(), username: user.username };
      // creo il token con jwt (sign per firmare)
      const token = jwt.sign(data, JWT_SECRET, { expiresIn: 86400 }); // 24 ore
      // lasciamo che si occupi il browser di gestire il token con i cookies
      res.cookie("token", token, { httpOnly: true }); // httpOnly: true significa che il cookie è visibile solo dal browser (non si può rubare)
      // -> ora il browser manderà il cookie con il token
      res.json({ msg: "Autenticazione avvenuta con successo" });
    } else {
      res.status(401).json({ msg: "Username o password errati" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Errore interno" });
  }
});

module.exports = router;
