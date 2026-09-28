import {
    EnrollmentStatus,
} from "@prisma/client";
import type {
    Request,
    Response,
} from "express";
import { EnrollmentService } from "./enrollemnt.service.js";
import { CreateEnrollmentInput, ListEnrollmentsQuery, UpdateEnrollementStatusInput } from "./enrollment.dto.js";
import { AppError } from "../../common/errors/AppError.js";

export class EnrollmentController {
    constructor(
        private readonly enrollmentService:
            EnrollmentService,
    ) { }

    create = async (
        request: Request<
            Record<string, never>,
            unknown,
            CreateEnrollmentInput
        >,
        response: Response,
    ): Promise<void> => {
        const enrollment =
            await this.enrollmentService.enrollStudent(
                request.body,
            );

        response.status(201).json({
            success: true,
            data: enrollment,
        });
    };

    findById = async (
        request: Request<{ id: string }>,
        response: Response,
    ): Promise<void> => {
        const id = this.parsePositiveInteger(
            request.params.id,
            "enrollmentId",
        );

        const enrollment =
            await this.enrollmentService
                .getEnrollmentById(id);

        response.status(200).json({
            success: true,
            data: enrollment,
        });
    };

    findMany = async (
        request: Request,
        response: Response,
    ): Promise<void> => {
        const query: ListEnrollmentsQuery = {
            page: this.parseOptionalInteger(
                request.query.page,
                "page",
            ),

            limit: this.parseOptionalInteger(
                request.query.limit,
                "limit",
            ),

            studentId: this.parseOptionalInteger(
                request.query.studentId,
                "studentId",
            ),

            courseId: this.parseOptionalInteger(
                request.query.courseId,
                "courseId",
            ),

            status: this.parseOptionalStatus(
                request.query.status,
            ),
        };

        const result =
            await this.enrollmentService
                .listEnrollments(query);

        response.status(200).json({
            success: true,
            data: result.enrollments,
            pagination: result.pagination,
        });
    };

    updateStatus = async (
        request: Request<
            { id: string },
            unknown,
            UpdateEnrollementStatusInput
        >,
        response: Response,
    ): Promise<void> => {
        const id = this.parsePositiveInteger(
            request.params.id,
            "enrollmentId",
        );

        const enrollment =
            await this.enrollmentService
                .updateEnrollmentStatus(
                    id,
                    request.body,
                );

        response.status(200).json({
            success: true,
            data: enrollment,
        });
    };

    delete = async (
        request: Request<{ id: string }>,
        response: Response,
    ): Promise<void> => {
        const id = this.parsePositiveInteger(
            request.params.id,
            "enrollmentId",
        );


        await this.enrollmentService
            .deleteEnrollment(id);

        response.status(204).send();
    };

    private parseOptionalStatus(
        value: unknown,
    ): EnrollmentStatus | undefined {
        if (value === undefined) {
            return undefined;
        }

        if (
            typeof value !== "string" ||
            !Object.values(EnrollmentStatus).includes(
                value as EnrollmentStatus,
            )
        ) {
            throw new AppError(
                400,
                "INVALID_ENROLLMENT_STATUS",
                "Status must be PENDING, COMPLETED, or DROPPED.",
            );
        }

        return value as EnrollmentStatus;
    }

    private parseOptionalInteger(
        value: unknown,
        fieldName: string,
    ): number | undefined {
        if (value === undefined) {
            return undefined;
        }

        return this.parsePositiveInteger(
            value,
            fieldName,
        );
    }

    private parsePositiveInteger(
        value: unknown,
        fieldName: string,
    ): number {
        if (
            typeof value !== "string" &&
            typeof value !== "number"
        ) {
            throw new AppError(
                400,
                `INVALID_${fieldName.toUpperCase()}`,
                `${fieldName} must be a positive integer.`,
            );
        }

        const parsedValue = Number(value);

        if (
            !Number.isInteger(parsedValue) ||
            parsedValue <= 0
        ) {
            throw new AppError(
                400,
                `INVALID_${fieldName.toUpperCase()}`,
                `${fieldName} must be a positive integer.`,
            );
        }

        return parsedValue;
    }

    findStudentsByCourse = async (
        request: Request<{
            courseId: string;
        }>,
        response: Response,
    ): Promise<void> => {
        const courseId =
            this.parsePositiveInteger(
                request.params.courseId,
                "courseId",
            );

        const page =
            this.parseOptionalInteger(
                request.query.page,
                "page",
            );

        const limit =
            this.parseOptionalInteger(
                request.query.limit,
                "limit",
            );

        const status =
            this.parseOptionalStatus(
                request.query.status,
            );

        const result =
            await this.enrollmentService
                .getStudentsByCourse(
                    courseId,
                    {
                        page,
                        limit,
                        status,
                    },
                );

        response.status(200).json({
            success: true,
            data: result,
        });
    };
}