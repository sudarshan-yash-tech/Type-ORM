import { Router } from "express";
import { StudentController } from "./controllers/student.controller.js";
import { asyncHandler } from "../../common/middlewares/asyncHandler.js";

export function createStudentRouter(
    controller: StudentController,
): Router {
    const router = Router();

    router.post(
        "/",
        asyncHandler(controller.create),
    );

    router.get(
        "/",
        asyncHandler(controller.findMany),
    );

    router.get(
        "/:id",
        asyncHandler(controller.findById),
    );

    router.patch(
        "/:id",
        asyncHandler(controller.update),
    );

    router.delete(
        "/:id",
        asyncHandler(controller.delete),
    );
    
    return router;
}