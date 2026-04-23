import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../middleware/errorHandler.js";
import { updateNameSchema, changePasswordSchema, deleteAccountSchema } from "./profile.schema.js";
import {
  getProfileController,
  updateNameController,
  changePasswordController,
  deleteSessionController,
  deleteAccountController,
} from "./profile.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/",                                                    asyncHandler(getProfileController));
router.patch("/name",      updateNameSchema,    validate,         asyncHandler(updateNameController));
router.patch("/password",  changePasswordSchema, validate,        asyncHandler(changePasswordController));
router.delete("/sessions/:sessionId",                             asyncHandler(deleteSessionController));
router.delete("/",         deleteAccountSchema, validate,         asyncHandler(deleteAccountController));

export default router;
