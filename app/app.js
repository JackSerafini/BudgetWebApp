// importiamo tutti i moduli necessari
const express = require("express");
const cookieParser = require("cookie-parser");
const auth = require("./routes/auth");
const budget = require("./routes/budget");
const balance = require("./routes/balance");
const users = require("./routes/users");

const app = express(); // creiamo un'applicazione express
const PORT = 3000; // definiamo la porta

app.use(express.static(`${__dirname}/public`)); // middleware per servire file statici dalla directory public
app.use(express.json()); // middleware per gestire le richieste JSON
app.use(express.urlencoded({ extended: true })); // middleware per gestire le richieste URL encoded
app.use(cookieParser()); // middleware per gestire i cookies

app.use("/api/auth", auth); // configuriamo le rotte per l'autenticazione
app.use("/api/budget", budget); // configuriamo le rotte per il budget
app.use("/api/balance", balance); // configuriamo le rotte per il bilancio
app.use("/api/users", users); // configuriamo le rotte per gli utenti

// avviamo il server sulla porta specificata
app.listen(PORT, () => {
  console.log(`Web server started on http://localhost:${PORT}`);
});
