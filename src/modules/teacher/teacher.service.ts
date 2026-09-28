import { TeacherRepository } from "./teacher.repository.js";
import { CreateTeacherInput, ListTeachersQuery, UpdateTeacherInput } from "./teacher.dto.js";
import { AppError } from "../../common/errors/AppError.js";
import { TeacherModel } from "./teacher.model.js";

export class TeacherService {
    constructor(
        private readonly teacherRepository:
            TeacherRepository,
    ) { }

    async createTeacher(
        input: CreateTeacherInput,
    ): Promise<TeacherModel> {
        const email = this.normalizeEmail(
            input.email,
        );

        const fullName = this.normalizeFullName(
            input.fullName,
        );

        const specialization =
            this.normalizeOptionalText(
                input.specialization,
            );

        await this.ensureEmailIsAvailable(email);

        return this.teacherRepository.create({
            email,
            fullName,
            specialization,
        });
    }

    async getTeacherById(
        id: number,
    ): Promise<TeacherModel> {
        const teacher =
            await this.teacherRepository.findById(id);

        if (!teacher) {
            throw new AppError(
                404,
                "TEACHER_NOT_FOUND",
                `Teacher with ID ${id} was not found.`,
            );
        }

        return teacher;
    }

    async listTeachers(
        query: ListTeachersQuery,
    ): Promise<{
        teachers: TeacherModel[];
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
                "Limit must be an integer between 1 and 100.",
            );
        }

        const result =
            await this.teacherRepository.findMany({
                page,
                limit,
                search: query.search?.trim(),
            });

        return {
            teachers: result.teachers,
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

    async updateTeacher(
        id: number,
        input: UpdateTeacherInput,
    ): Promise<TeacherModel> {
        await this.getTeacherById(id);

        const updateData: UpdateTeacherInput = {};

        if (input.email !== undefined) {
            const email = this.normalizeEmail(
                input.email,
            );

            const teacherWithEmail =
                await this.teacherRepository.findByEmail(
                    email,
                );

            if (
                teacherWithEmail &&
                teacherWithEmail.id !== id
            ) {
                throw new AppError(
                    409,
                    "TEACHER_EMAIL_ALREADY_EXISTS",
                    "A teacher with this email already exists.",
                );
            }

            updateData.email = email;
        }

        if (input.fullName !== undefined) {
            updateData.fullName =
                this.normalizeFullName(
                    input.fullName,
                );
        }

        if (input.specialization !== undefined) {
            updateData.specialization =
                input.specialization === null
                    ? null
                    : this.normalizeOptionalText(
                        input.specialization,
                    ) ?? null;
        }

        if (Object.keys(updateData).length === 0) {
            throw new AppError(
                400,
                "NO_TEACHER_FIELDS_TO_UPDATE",
                "Provide at least one teacher field to update.",
            );
        }

        return this.teacherRepository.update(
            id,
            updateData,
        );
    }

    async deleteTeacher(id: number): Promise<void> {
        await this.getTeacherById(id);

        const hasAssignments =
            await this.teacherRepository.hasAssignments(
                id,
            );

        if (hasAssignments) {
            throw new AppError(
                409,
                "TEACHER_HAS_ASSIGNMENTS",
                "The teacher cannot be deleted because teaching assignments exist.",
            );
        }

        await this.teacherRepository.delete(id);
    }

    private async ensureEmailIsAvailable(
        email: string,
    ): Promise<void> {
        const existingTeacher =
            await this.teacherRepository.findByEmail(
                email,
            );

        if (existingTeacher) {
            throw new AppError(
                409,
                "TEACHER_EMAIL_ALREADY_EXISTS",
                "A teacher with this email already exists.",
            );
        }
    }

    private normalizeEmail(
        email: string,
    ): string {
        if (typeof email !== "string") {
            throw new AppError(
                400,
                "INVALID_TEACHER_EMAIL",
                "Teacher email must be a string.",
            );
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        if (!normalizedEmail) {
            throw new AppError(
                400,
                "TEACHER_EMAIL_REQUIRED",
                "Teacher email is required.",
            );
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedEmail)) {
            throw new AppError(
                400,
                "INVALID_TEACHER_EMAIL",
                "A valid teacher email is required.",
            );
        }

        if (normalizedEmail.length > 254) {
            throw new AppError(
                400,
                "TEACHER_EMAIL_TOO_LONG",
                "Teacher email cannot exceed 254 characters.",
            );
        }

        return normalizedEmail;
    }

    private normalizeFullName(
        fullName: string,
    ): string {
        if (typeof fullName !== "string") {
            throw new AppError(
                400,
                "INVALID_TEACHER_FULL_NAME",
                "Teacher full name must be a string.",
            );
        }

        const normalizedFullName =
            fullName.trim();

        if (!normalizedFullName) {
            throw new AppError(
                400,
                "TEACHER_FULL_NAME_REQUIRED",
                "Teacher full name is required.",
            );
        }

        if (normalizedFullName.length > 254) {
            throw new AppError(
                400,
                "TEACHER_FULL_NAME_TOO_LONG",
                "Teacher full name cannot exceed 254 characters.",
            );
        }

        return normalizedFullName;
    }

    private normalizeOptionalText(
        value?: string,
    ): string | undefined {
        if (value === undefined) {
            return undefined;
        }

        if (typeof value !== "string") {
            throw new AppError(
                400,
                "INVALID_SPECIALIZATION",
                "Teacher specialization must be a string.",
            );
        }

        const normalizedValue = value.trim();

        if (normalizedValue.length > 254) {
            throw new AppError(
                400,
                "SPECIALIZATION_TOO_LONG",
                "Teacher specialization cannot exceed 254 characters.",
            );
        }

        return normalizedValue || undefined;
    }
}