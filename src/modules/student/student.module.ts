import { appDataSource } from "../../database/data-source.js";
import { StudentEntity } from "../../database/entities/student.entity.js";
import { StudentController } from "./controllers/student.controller.js";
import { StudentService } from "./services/student.service.js";
import { createStudentRouter } from "./student.route.js";
import { TypeOrmStudentRepository } from "./typeorm-student-repositoy.js";
import type { Router } from "express";

export function createStudentModule(): Router {
    const studentRepository =
        new TypeOrmStudentRepository(
            appDataSource.getRepository(
                StudentEntity,
            ),
        );

    const studentService =
        new StudentService(
            studentRepository,
        );

    const studentController =
        new StudentController(
            studentService,
        );

    return createStudentRouter(
        studentController,
    );
}

export const studentRouter = createStudentModule();