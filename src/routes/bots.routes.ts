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

botsRouter.post("/invite", (request, response) => {
    try {
        const { steamID } = request.body;
        const matchData = bots[0].inviteToDotaLobby(steamID);

        return response.json({ message: matchData });
    } catch (err) {
        return response.json({ message: err });
    }
});

botsRouter.post("/match", (request, response) => {
    try {
        const { matchID } = request.body;
        let matchData = bots[0].matchDataLobby(matchID);

        console.log(matchData);
        return response.json(matchData);
    } catch (err) {
        return response.json({ message: err });
    }
});

botsRouter.post("/startgame", (request, response) => {
    try {
        bots[0].startGameLobby();
        return response.json({ message: "Bot começou a partida com sucesso." });
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
