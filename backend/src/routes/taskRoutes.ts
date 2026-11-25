
import { Router } from "express";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  clearTasks,
} from "../controllers/taskController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.get("/", getTasks);
router.post("/", createTask);
router.delete("/clear/all", clearTasks);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
