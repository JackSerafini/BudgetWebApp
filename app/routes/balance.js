// File per gestire l'URL /api/balance
const express = require("express");
const db = require("../db");
const verifyToken = require("./token-verif");
const router = express.Router();

// metodo asincrono per ottenere tutti gli utenti eccetto quello corrente
const getUsers = async (username) => {
  // ci connettiamo al database, precisamente alla collection degli utenti
  const mongo = await db.connectToDatabase();
  const users = await mongo
    .collection("users")
    .find({ username: { $ne: username } })
    .toArray(); // $ne = not equal
  const validUsers = users.filter(
    (user) => user.username !== null && user.username !== undefined
  );
  // creiamo un nuovo array contenente gli username di tutti gli utenti
  return validUsers.map((user) => user.username);
};

// metodo asincrono per calcolare il bilancio tra due utenti
const calculateBalances = async (username) => {
  // ci connettiamo al database, precisamente alla collection delle spese
  const mongo = await db.connectToDatabase();
  const expenses = await mongo
    .collection("budgets")
    .find({
      // cerchiamo l'utente che fa il match con l'username passato in input
      $or: [{ userId: username }, { "sharedWith.username": username }],
    })
    .toArray();

  const balances = {};
  const allUsers = await getUsers(username);

  // per ogni utente impostiamo il bilancio pari a 0
  allUsers.forEach((user) => {
    balances[user] = 0;
  });

  // per ogni spesa nelle expenses
  expenses.forEach((expense) => {
    if (expense.sharedWith.length === 0) {
      return;
    }

    const totalAmount = expense.amount;
    const totalSharedUsers = expense.sharedWith.length;
    const fairShare = totalAmount / totalSharedUsers;

    // mi creo un nuovo dizionario salvando le quote degli utenti, per modificarle senza cambiare le vere quote
    const shares = {};
    expense.sharedWith.forEach((shared) => {
      shares[shared.username] = shared.share;
    });
    // a fine ciclo tutte le shares devono essere uguali a fairShare

    // per ogni elemento in sharedWith (sharedWith: [{ username, share }])
    expense.sharedWith.forEach((shared) => {
      // prendiamo l'username dell'elemento
      const otherUser = shared.username;
      // se l'username è diverso da quello dato è un altro utente
      if (otherUser !== username) {
        // e se non esiste ancora un bilancio tra i due utenti lo impostiamo a 0
        if (balances[otherUser] === undefined) {
          balances[otherUser] = 0;
        }
        // otteniamo la quota dell'user e dell'altro utente
        const userShare = shares[username];
        const otherShare = shares[otherUser];
        // otteniamo la differenza tra le quote pagate e quelle eque
        const userDiff = userShare - fairShare;
        const otherDiff = otherShare - fairShare;

        if (userDiff > 0) {
          // credito
          if (otherDiff > 0) {
            // anche l'altro user ha un credito (ha pagato più di fairShare)
            balances[otherUser] += 0;
          } else {
            // aggiorniamo il bilancio con l'altro utente (nel caso di credito)
            balances[otherUser] += Math.min(userDiff, -otherDiff); // il bilancio cresce di quanto è dovuto dall'altro utente
            shares[username] -= Math.min(userDiff, -otherDiff); // riduciamo il credito di quanto l'utente viene pagato
            shares[otherUser] += Math.min(userDiff, -otherDiff); // riduciamo il debito di quanto l'altro utente paga
          }
        } else {
          // debito
          if (otherDiff < 0) {
            // anche l'altro user ha un debito (ha pagato meno di fairShare)
            balances[otherUser] += 0;
          } else {
            // aggirniamo il bilancio con l'altro utente (nel caso di debito)
            balances[otherUser] += Math.max(userDiff, -otherDiff); // il bilancio diminuisce di quanto si deve all'altro utente (essendo < 0 prendiamo il max)
            shares[username] -= Math.max(userDiff, -otherDiff); // riduciamo il debito di quanto l'utente paga
            shares[otherUser] += Math.max(userDiff, -otherDiff); // riduciamo il credito di quanto l'altro utente viene pagato
          }
        }
      }
    });
  });

  return balances;
};

// metodo asincrono per visualizzare il riassunto dare/avere dell’utente loggato
router.get("/", verifyToken, async (req, res) => {
  try {
    // calcoliamo i bilanci dell'utente corrente
    const balances = await calculateBalances(req.username);
    res.json(balances);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Errore interno" });
  }
});

// metodo asincrono per cercare visualizzare il bilancio tra l’utente loggato e l’utente specificato
router.get("/:otherUsername", verifyToken, async (req, res) => {
  try {
    // otteniamo l'username dell'utente da ricercare dai parametri
    const otherUsername = req.params.otherUsername;
    // calcoliamo i bilanci dell'utente corrente
    const balances = await calculateBalances(req.username);

    // controlliamo se esiste un bilancio con l'utente cercato, altrimenti lo impostiamo a 0
    if (balances[otherUsername] !== undefined) {
      res.json({ balance: balances[otherUsername] });
    } else {
      res.json({ balance: 0 });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Errore interno" });
  }
});

// metodo asincrono per visualizzare le spese in comune tra l’utente loggato e l’utente specificato
router.get("/common-expenses/:otherUsername", verifyToken, async (req, res) => {
  try {
    // otteniamo l'username dell'utente da ricercare dai parametri
    const { otherUsername } = req.params;
    // ci connettiamo al database, precisamente alla collection delle spese
    const mongo = await db.connectToDatabase();
    const commonExpenses = await mongo
      .collection("budgets")
      .find({
        // cerchiamo tutte le spese che hanno come userID o in sharedWith l’utente loggato e l’utente specificato
        $and: [
          {
            $or: [
              { userId: req.userId },
              { "sharedWith.username": req.username },
            ],
          },
          {
            $or: [
              { userId: otherUsername },
              { "sharedWith.username": otherUsername },
            ],
          },
        ],
      })
      .toArray();
    res.json(commonExpenses);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Errore interno" });
  }
});

module.exports = router;
