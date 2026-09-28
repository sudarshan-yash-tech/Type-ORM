import type { Router } from "express";
import { TypeOrmStudentRepository } from "../student/typeorm-student-repositoy.js";
import { appDataSource } from "../../database/data-source.js";
import { StudentEntity } from "../../database/entities/student.entity.js";
import { TypeOrmCourseRepository } from "../course/typeorm-course.repository.js";
import { CourseEntity } from "../../database/entities/course.entity.js";
import { TypeOrmEnrollmentRepository } from "./typeorm-enrollment.repository.js";
import { EnrollmentEntity } from "../../database/entities/enrollment.entity.js";
import { EnrollmentService } from "./enrollemnt.service.js";
import { EnrollmentController } from "./enrollment.controller.js";
import { createEnrollmentRouter } from "./enrollment.routes.js";

export function createEnrollmentModule(): Router {
    const studentRepository =
        new TypeOrmStudentRepository(
            appDataSource.getRepository(
                StudentEntity,
            ),
        );

    const courseRepository =
        new TypeOrmCourseRepository(
            appDataSource.getRepository(
                CourseEntity,
            ),
        );

    const enrollmentRepository =
        new TypeOrmEnrollmentRepository(
            appDataSource.getRepository(
                EnrollmentEntity,
            ),
        );

    const enrollmentService =
        new EnrollmentService(
            studentRepository,
            courseRepository,
            enrollmentRepository,
        );

    const enrollmentController =
        new EnrollmentController(
            enrollmentService,
        );

    return createEnrollmentRouter(
        enrollmentController,
    );
}