import type { Router } from "express";
import { appDataSource } from "../../database/data-source.js";
import { TeacherEntity } from "../../database/entities/teacher.entity.js";
import { TypeOrmTeacherRepository } from "./typeorm-teacher.repository.js";
import { TeacherService } from "./teacher.service.js";
import { TeacherController } from "./teacher.controller.js";
import { createTeacherRouter } from "./teacher.routes.js";


export function createTeacherModule(): Router {
    const typeOrmRepository =
        appDataSource.getRepository(
            TeacherEntity,
        );

    const teacherRepository =
        new TypeOrmTeacherRepository(
            typeOrmRepository,
        );

    const teacherService =
        new TeacherService(
            teacherRepository,
        );

    const teacherController =
        new TeacherController(
            teacherService,
        );

    return createTeacherRouter(
        teacherController,
    );
}