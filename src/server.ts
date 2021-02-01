import express, { response } from "express";

const app = express();

app.get("/", () => {
  return response.json({ message: "Sim" });
});

app.listen(3333, () => {
  console.log("Servidor está online na porta 3333.");
});
