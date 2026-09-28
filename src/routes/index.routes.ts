import { Router } from "express";
import { createStudentModule, studentRouter } from "../modules/student/student.module.js";
import { createCourseModule } from "../modules/course/course.module.js";
import { createEnrollmentModule } from "../modules/enrollment/enrollment.module.js";
import { createTeacherModule } from "../modules/teacher/teacher.module.js";

export function createApiRouter(): Router {
    const router = Router();

    router.use(
        "/students",
        createStudentModule(),
    );

    router.use(
        "/courses",
        createCourseModule(),
    );

    router.use(
        "/enrollments",
        createEnrollmentModule(),
    )

    router.use(
        "/teachers",
        createTeacherModule(),
    );
    return router;
}