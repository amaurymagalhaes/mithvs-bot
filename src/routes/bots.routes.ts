import { Router } from "express";
import Bot from "../bot";

const botsRouter = Router();

const bots: Bot[] = [];

botsRouter.post("/", (request, response) => {
    try {
        const bot = new Bot();
        bots.push(bot);
        return response.json({ message: "Bot criado com sucesso." });
    } catch (err) {
        return response.json({ message: err });
    }
});
botsRouter.get("/all", (request, response) => {
    return response.json(bots.length);
});
botsRouter.post("/destroy", (request, response) => {
    try {
        bots[0].exitDota();
        bots.pop();
        return response.json({ message: "Bot desligado com sucesso." });
    } catch (err) {
        return response.json({ message: err });
    }
});

botsRouter.post("/start", (request, response) => {
    try {
        bots[0].createDotaLobby();
        return response.json({ message: "Bot criou o lobby com sucesso." });
    } catch (err) {
        return response.json({ message: err });
    }
});
botsRouter.post("/leave", (request, response) => {
    try {
        bots[0].leaveDotaLobby();
        return response.json({ message: "Bot saiu do lobby com sucesso." });
    } catch (err) {
        return response.json({ message: err });
    }
});

export default botsRouter;
