import "reflect-metadata";
import { DataSource } from "typeorm";
import { StudentEntity } from "./entities/student.entity.js";
import { CourseEntity } from "./entities/course.entity.js";
import { EnrollmentEntity } from "./entities/enrollment.entity.js";
import { TeacherEntity } from "./entities/teacher.entity.js";

export const appDataSource =
    new DataSource({
        type: "mysql",

        host: process.env.DB_HOST ?? "localhost",

        port: Number(
            process.env.DB_PORT ?? 3306,
        ),

        username:
            process.env.DB_USER ?? "root",

        password:
            'root',

        database:
            process.env.DB_NAME ??
            "civicfix",

        entities: [
            StudentEntity,
            CourseEntity,
            EnrollmentEntity,
            TeacherEntity
        ],

        migrations: [
            "src/database/migrations/*.ts",
            "dist/database/migrations/*.js",
        ],

        synchronize: false,
        migrationsTableName:
            "typeorm_migrations",

        logging:
            process.env.NODE_ENV ===
            "development",
    });