import { Router } from "express";

import {
  createAccountController,
  getAccountController,
  getAccountsController,
} from "../controllers/account.controller";

const router = Router();

router.post("/", createAccountController);

router.get("/", getAccountsController);

router.get("/:id", getAccountController);

export default router;