import express from "express";
import { submitDonation, getUserDonations } from "../controllers/donationController.js";

const donationRouter = express.Router();

donationRouter.post("/donate", submitDonation);
donationRouter.get("/user-donations", getUserDonations);

export default donationRouter;
