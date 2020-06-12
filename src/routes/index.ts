import { Express } from "express";


export default (app: Express) => {
  app.get("/", (req, res, next) => {
    res.send("Putanginamo");
  });
};
