import express, { response } from "express";

import routes from "./routes";

const app = express();

app.use(express.json(), routes);

app.listen(3333, () => {
    console.log("Servidor está online na porta 3333.");
});
