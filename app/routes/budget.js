// File per gestire l'URL /api/budget
const express = require("express");
const db = require("../db");
const verifyToken = require("./token-verif");
const { ObjectId } = require("mongodb");
const router = express.Router();

// metodo asincrono per cercare le spese dell’utente loggato
router.get("/", verifyToken, async (req, res) => {
  try {
    // ci connettiamo al database, precisamente alla collection delle spese
    const mongo = await db.connectToDatabase();
    const budgets = await mongo
      .collection("budgets")
      .find({
        // cerchiamo tutte le spese che hanno l'utente associato (o con l'ID o in sharedWith)
        $or: [
          { userId: new ObjectId(req.userId) },
          { "sharedWith.username": req.username },
        ],
      })
      .toArray();
    res.json(budgets);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Errore interno" });
  }
});

// metodo asincrono per cercare la spesa che matcha la stringa query
router.get("/search", verifyToken, async (req, res) => {
  try {
    // otteniamo la stringa query dalla richiesta
    const query = req.query.q;
    // ci connettiamo al database, precisamente alla collection delle spese
    const mongo = await db.connectToDatabase();
    const budgets = await mongo
      .collection("budgets")
      .find({
        // $and per cercare le spese che fanno il match con entrambe le cose (ID e query)
        $and: [
          // spese che fanno il match con userID o con l'username
          {
            $or: [
              { userId: new ObjectId(req.userId) },
              { "sharedWith.username": req.username },
            ],
          },
          // spese che fanno il match con la query o nella descrizione o nella categoria
          {
            $or: [
              { description: { $regex: query, $options: "i" } },
              { category: { $regex: query, $options: "i" } },
            ],
          },
        ],
      })
      .toArray();

    res.json(budgets);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Errore interno" });
  }
});

// metodo asincrono per restituire le informazioni sull’utente se autenticato
router.get("/whoami", verifyToken, async (req, res) => {
  try {
    // ci connettiamo al database, precisamente alla collection degli utenti
    const mongo = await db.connectToDatabase();
    const user = await mongo
      .collection("users")
      .findOne({ _id: new ObjectId(req.userId) });

    if (user) {
      console.log("Utente trovato:", user);
      res.json({
        username: user.username,
        name: user.name,
        surname: user.surname,
      });
    } else {
      console.log("Utente non trovato");
      res.status(404).json({ msg: "Utente non trovato" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Errore interno" });
  }
});

// metodo asincrono per cercare le spese dell’utente loggato relative all’anno year
router.get("/:year", verifyToken, async (req, res) => {
  try {
    // otteniamo year dai parametri
    const { year } = req.params;
    // ci connettiamo al database, precisamente alla collection delle spese
    const mongo = await db.connectToDatabase();
    const budgets = await mongo
      .collection("budgets")
      .find({
        // cerchiamo la spese con anno = year e associate all'utente loggato
        year: parseInt(year),
        $or: [
          { userId: new ObjectId(req.userId) },
          { "sharedWith.username": req.username },
        ],
      })
      .toArray();
    res.json(budgets);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Errore interno" });
  }
});

// metodo asincrono per cercare le spese dell’utente loggato relative al mese month dell’anno year
router.get("/:year/:month", verifyToken, async (req, res) => {
  try {
    // otteniamo year e month dai parametri
    const { year, month } = req.params;
    // ci connettiamo al database, precisamente alla collection delle spese
    const mongo = await db.connectToDatabase();
    const budgets = await mongo
      .collection("budgets")
      .find({
        // cerchiamo la spese con anno = year, mese = month e associate all'utente loggato
        year: parseInt(year),
        month: parseInt(month),
        $or: [
          { userId: new ObjectId(req.userId) },
          { "sharedWith.username": req.username },
        ],
      })
      .toArray();
    res.json(budgets);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Errore interno" });
  }
});

// metodo asincrono per ottenere il dettaglio della spesa id nel mese month dell’anno year
router.get("/:year/:month/:id", verifyToken, async (req, res) => {
  try {
    // otteniamo year, month e id dai parametri
    const { year, month, id } = req.params;
    // ci connettiamo al database, precisamente alla collection delle spese
    const mongo = await db.connectToDatabase();
    const budget = await mongo.collection("budgets").findOne({
      // cerchiamo la spese con anno = year, mese = month, _id = id e associate all'utente loggato
      _id: new ObjectId(id),
      year: parseInt(year),
      month: parseInt(month),
      $or: [
        { userId: new ObjectId(req.userId) },
        { "sharedWith.username": req.username },
      ],
    });
    if (budget) {
      res.json(budget);
    } else {
      res.status(404).json({ msg: "Spesa non trovata" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Errore interno" });
  }
});

// metodo asincrono per aggiungere una spesa nel mese month dell’anno year
router.post("/:year/:month", verifyToken, async (req, res) => {
  try {
    // otteniamo year e month dai parametri
    const { year, month } = req.params;
    // recuperiamo tutti i dati dal body della request
    const { date, description, amount, category, sharedWith } = req.body;
    // ci connettiamo al database, precisamente alla collection delle spese
    const mongo = await db.connectToDatabase();
    // costruiamo la nuova spesa con tutti i dati
    const newBudget = {
      year: parseInt(year),
      month: parseInt(month),
      date,
      description,
      amount,
      category,
      sharedWith,
      userId: new ObjectId(req.userId),
    };
    await mongo.collection("budgets").insertOne(newBudget);
    res.status(201).json({ msg: "Spesa aggiunta con successo", newBudget });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Errore interno" });
  }
});

// metodo asincrono per modificare la spesa id nel mese month dell’anno year
router.put("/:year/:month/:id", verifyToken, async (req, res) => {
  try {
    // otteniamo year, month e ID dai parametri
    const { year, month, id } = req.params;
    // recuperiamo tutti i dati dal body della request
    const { date, description, amount, category, sharedWith } = req.body;
    // ci connettiamo al database, precisamente alla collection delle spese
    const mongo = await db.connectToDatabase();
    // costruiamo la "nuova" spesa con tutti i dati
    const updatedBudget = { date, description, amount, category, sharedWith };
    // e facciamo la modifica alla spesa che fa il match con i parametri passati
    const result = await mongo.collection("budgets").updateOne(
      {
        _id: new ObjectId(id),
        year: parseInt(year),
        month: parseInt(month),
        $or: [
          { userId: new ObjectId(req.userId) },
          { "sharedWith.username": req.username },
        ],
      },
      { $set: updatedBudget }
    ); // usiamo $set per modificare il valore di un field in un documento
    if (result.matchedCount > 0) {
      res.json({ msg: "Spesa aggiornata con successo" });
    } else {
      res.status(404).json({ msg: "Budget non trovato" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Errore interno" });
  }
});

// metodo asincrono per rimuovere la spesa id nel mese month dell’anno year
router.delete("/:year/:month/:id", verifyToken, async (req, res) => {
  try {
    // otteniamo year, month e ID dai parametri
    const { year, month, id } = req.params;
    // ci connettiamo al database, precisamente alla collection delle spese
    const mongo = await db.connectToDatabase();
    // ed eliminiamo la spesa che fa il match con i parametri passati
    const result = await mongo.collection("budgets").deleteOne({
      _id: new ObjectId(id),
      year: parseInt(year),
      month: parseInt(month),
      $or: [
        { userId: new ObjectId(req.userId) },
        { "sharedWith.username": req.username },
      ],
    });
    if (result.deletedCount > 0) {
      res.json({ msg: "Spesa eliminata con successo" });
    } else {
      res.status(404).json({ msg: "Budget non trovato" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Errore interno" });
  }
});

module.exports = router;
