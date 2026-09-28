import { AppError } from "../../common/errors/AppError.js";
import { CourseRepository } from "../course/course.repository.js";
import { StudentRepository } from "../student/repositories/student.repository.js";
import { EnrollmentWithRelationsModel } from "./enrollement.model.js";
import { CreateEnrollmentInput, ListEnrollmentsQuery, UpdateEnrollementStatusInput } from "./enrollment.dto.js";
import { EnrollmentRepository, } from "./enrollment.repository.js";
import { EnrollmentStatus } from "./enrollment.status.enum.js";

export class EnrollmentService {
    constructor(
        private readonly studentRepository:
            StudentRepository,

        private readonly courseRepository:
            CourseRepository,

        private readonly enrollmentRepository:
            EnrollmentRepository,
    ) { }

    async enrollStudent(
        input: CreateEnrollmentInput,
    ): Promise<EnrollmentWithRelationsModel> {
        this.validatePositiveId(
            input.studentId,
            "studentId",
        );

        this.validatePositiveId(
            input.courseId,
            "courseId",
        );

        const student =
            await this.studentRepository.findById(
                input.studentId,
            );

        if (!student) {
            throw new AppError(
                404,
                "STUDENT_NOT_FOUND",
                `Student with ID ${input.studentId} was not found.`,
            );
        }

        const course =
            await this.courseRepository.findById(
                input.courseId,
            );

        if (!course) {
            throw new AppError(
                404,
                "COURSE_NOT_FOUND",
                `Course with ID ${input.courseId} was not found.`,
            );
        }

        const existingEnrollment =
            await this.enrollmentRepository
                .findByStudentAndCourse(
                    input.studentId,
                    input.courseId,
                );

        if (existingEnrollment) {
            throw new AppError(
                409,
                "STUDENT_ALREADY_ENROLLED",
                "The student is already enrolled in this course.",
            );
        }

        return this.enrollmentRepository.create({
            studentId: input.studentId,
            courseId: input.courseId,
        });
    }

    async getEnrollmentById(
        id: number,
    ): Promise<EnrollmentWithRelationsModel> {
        const enrollment =
            await this.enrollmentRepository.findById(
                id,
            );

        if (!enrollment) {
            throw new AppError(
                404,
                "ENROLLMENT_NOT_FOUND",
                `Enrollment with ID ${id} was not found.`,
            );
        }

        return enrollment;
    }

    async listEnrollments(
        query: ListEnrollmentsQuery,
    ): Promise<{
        enrollments: EnrollmentWithRelationsModel[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;

        if (!Number.isInteger(page) || page < 1) {
            throw new AppError(
                400,
                "INVALID_PAGE",
                "Page must be a positive integer.",
            );
        }

        if (
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 100
        ) {
            throw new AppError(
                400,
                "INVALID_LIMIT",
                "Limit must be between 1 and 100.",
            );
        }

        if (query.studentId !== undefined) {
            this.validatePositiveId(
                query.studentId,
                "studentId",
            );
        }

        if (query.courseId !== undefined) {
            this.validatePositiveId(
                query.courseId,
                "courseId",
            );
        }

        const result =
            await this.enrollmentRepository.findMany({
                ...query,
                page,
                limit,
            });

        return {
            enrollments: result.enrollments,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(
                    result.total / limit,
                ),
            },
        };
    }

    async updateEnrollmentStatus(
        id: number,
        input: UpdateEnrollementStatusInput,
    ): Promise<EnrollmentWithRelationsModel> {
        const enrollment =
            await this.getEnrollmentById(id);

        this.validateStatus(input.staus);

        if (enrollment.status === input.staus) {
            throw new AppError(
                409,
                "ENROLLMENT_STATUS_UNCHANGED",
                `Enrollment is already ${input.staus}.`,
            );
        }

        this.ensureValidStatusTransition(
            enrollment.status,
            input.staus,
        );

        return this.enrollmentRepository.updateStatus(
            id,
            input.staus,
        );
    }

    async deleteEnrollment(
        id: number,
    ): Promise<void> {
        const enrollment =
            await this.getEnrollmentById(id);

        if (
            enrollment.status ===
            EnrollmentStatus.COMPLETED
        ) {
            throw new AppError(
                409,
                "COMPLETED_ENROLLMENT_CANNOT_BE_DELETED",
                "A completed enrollment cannot be deleted.",
            );
        }

        await this.enrollmentRepository.delete(id);
    }

    private ensureValidStatusTransition(
        currentStatus: EnrollmentStatus,
        nextStatus: EnrollmentStatus,
    ): void {
        const allowedTransitions:
            Record<
                EnrollmentStatus,
                EnrollmentStatus[]
            > = {
            PENDING: [
                EnrollmentStatus.COMPLETED,
                EnrollmentStatus.DROPPED,
            ],
            COMPLETED: [],
            DROPPED: [],
        };

        const isAllowed =
            allowedTransitions[currentStatus].includes(
                nextStatus,
            );

        if (!isAllowed) {
            throw new AppError(
                409,
                "INVALID_ENROLLMENT_STATUS_TRANSITION",
                `Enrollment status cannot change from ${currentStatus} to ${nextStatus}.`,
            );
        }
    }

    private validateStatus(
        status: EnrollmentStatus,
    ): void {
        const validStatuses =
            Object.values(EnrollmentStatus);

        if (!validStatuses.includes(status)) {
            throw new AppError(
                400,
                "INVALID_ENROLLMENT_STATUS",
                "Status must be PENDING, COMPLETED, or DROPPED.",
            );
        }
    }

    private validatePositiveId(
        value: number,
        fieldName: string,
    ): void {
        if (
            !Number.isInteger(value) ||
            value <= 0
        ) {
            throw new AppError(
                400,
                `INVALID_${fieldName.toUpperCase()}`,
                `${fieldName} must be a positive integer.`,
            );
        }
    }

    async getStudentsByCourse(
        courseId: number,
        options: {
            page?: number;
            limit?: number;
            status?: EnrollmentStatus;
        },
    ): Promise<{
        enrollemtns: EnrollmentWithRelationsModel[],
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };

    }> {
        this.validatePositiveId(
            courseId,
            "courseId",
        );

        const page = options.page ?? 1;
        const limit = options.limit ?? 10;

        if (!Number.isInteger(page) || page < 1) {
            throw new AppError(
                400,
                "INVALID_PAGE",
                "Page must be a positive integer.",
            );
        }

        if (
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 100
        ) {
            throw new AppError(
                400,
                "INVALID_LIMIT",
                "Limit must be between 1 and 100.",
            );
        }

        const course =
            await this.courseRepository.findById(
                courseId,
            );

        if (!course) {
            throw new AppError(
                404,
                "COURSE_NOT_FOUND",
                `Course with ID ${courseId} was not found.`,
            );
        }

        const result =
            await this.enrollmentRepository
                .findStudentByCourseId(
                    courseId,
                    {
                        page,
                        limit,
                        status: options.status,
                    },
                );

        return {
            enrollemtns: result.enrollments,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(
                    result.total / limit,
                ),
            },
        };
    }
}