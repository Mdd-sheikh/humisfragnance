import express from "express";
import {
    createQuery,
    getQueries,
    updateQueryStatus,
    deleteQuery,
} from "../controller/queryController.js";

const queryRouter = express.Router();

// Public: the shop's contact form
queryRouter.post("/create", createQuery);

// Admin panel (no login in the admin app yet, same as the other admin routes)
queryRouter.get("/getall", getQueries);
queryRouter.patch("/:id/status", updateQueryStatus);
queryRouter.delete("/:id", deleteQuery);

export default queryRouter;
