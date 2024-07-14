// File per la gestione del database
const { MongoClient } = require("mongodb");
const MONGODB_URI = "mongodb://mongosrv";
const DB_NAME = "budget"; // nome del database

let cachedDB; // variabile privata per memorizzare la connessione al database

module.exports = {
  connectToDatabase: async () => {
    // se esiste una connessione al database, la restituiamo
    if (cachedDB) {
      console.log("Existing cached connection found!");
      return cachedDB;
    }
    console.log("Acquiring new DB connection...");
    try {
      // altrimenti creaiamo una nuova connessione al database
      const client = await MongoClient.connect(MONGODB_URI);
      // selezioniamo il database con il nome dato
      const db = client.db(DB_NAME);
      // memorizziamo la connessione
      cachedDB = db;
      return db;
    } catch (error) {
      console.log("ERROR acquiring DB connection!");
      console.log(error);
      throw error;
    }
  },
};
