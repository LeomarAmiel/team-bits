import { Express } from "express";
import { parse } from "../parser";

export default (app: Express) => {
  app.get("/", async (req, res, next) => {
    const result = await parse(`${__dirname}/material.csv`);
    res.send(result);
  });
};
