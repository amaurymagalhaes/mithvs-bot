import { Router } from "express";

import botsRouter from "./bots.routes";

const routes = Router();

routes.use("/bots", botsRouter);

export default routes;
