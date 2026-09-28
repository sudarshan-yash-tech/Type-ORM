import type { Router } from "express";
import { appDataSource } from "../../database/data-source.js";
import { CourseEntity } from "../../database/entities/course.entity.js";
import { TypeOrmCourseRepository } from "./typeorm-course.repository.js";
import { CourseService } from "./course.service.js";
import { CourseController } from "./course.controller.js";
import { createCourseRouter } from "./course.routes.js";

export function createCourseModule(): Router {
    const typeOrmRepository =
        appDataSource.getRepository(
            CourseEntity,
        );

    const courseRepository =
        new TypeOrmCourseRepository(
            typeOrmRepository,
        );

    const courseService =
        new CourseService(
            courseRepository,
        );

    const courseController =
        new CourseController(
            courseService,
        );

    return createCourseRouter(
        courseController,
    );
}

export const courseRoter = createCourseModule();