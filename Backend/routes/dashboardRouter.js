import express from "express";
import { getDashboardData } from "../controller/dashboardController.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/", getDashboardData);

export default dashboardRouter;
