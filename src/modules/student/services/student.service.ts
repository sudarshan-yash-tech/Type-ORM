import { AppError } from "../../../common/errors/AppError.js";
import { StudentRepository } from "../repositories/student.repository.js";
import { CreateStudentInput, ListStudentQuery, updateStudentInput } from "../student.dto.js";
import { Student } from '@prisma/client';
import { StudentWithEnrollmentsModel } from '../student.model.js';

export class StudentService {
    constructor(private readonly studentRepository: StudentRepository) { }


    private validateEmail(email: string): void {
        const normalizedEmail = email.trim();

        if (!normalizedEmail) {
            throw new AppError(400, 'EMAIL_REQUIRED', 'Email is required!')
        }
        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedEmail)) {
            throw new AppError(
                400,
                "INVALID_EMAIL",
                "A valid email address is required.",
            );
        }

        if (normalizedEmail.length > 254) {
            throw new AppError(
                400,
                "EMAIL_TOO_LONG",
                "Email cannot exceed 254 characters.",
            );
        }

    }

    private validateFullName(
        fullName: string,
    ): void {
        const normalizedName = fullName.trim();

        if (!normalizedName) {
            throw new AppError(
                400,
                "FULL_NAME_REQUIRED",
                "Full name is required.",
            );
        }

        if (normalizedName.length > 254) {
            throw new AppError(
                400,
                "FULL_NAME_TOO_LONG",
                "Full name cannot exceed 254 characters.",
            );
        }
    }

    async createStudentInput(input: CreateStudentInput): Promise<Student> {
        this.validateEmail(input.email);
        this.validateFullName(input.fullName);

        const normalizedEmail = input.email.trim().toLowerCase();

        const existingStudent = await this.studentRepository.findByEmail(normalizedEmail);

        if (existingStudent) {
            throw new AppError(409, 'STUDENT_EMAIL_ALREADY_EXISTS', 'A student with this email already exists.')
        }

        return this.studentRepository.create({
            email: normalizedEmail,
            fullName: input.fullName.trim(),
            phoneNumber: input.phoneNumber?.trim() || undefined
        })
    }

    async getStudentById(id: number): Promise<StudentWithEnrollmentsModel> {
        const student = await this.studentRepository.findById(id);

        if (!student) {
            throw new AppError(404, 'STUDENT_NOT_FOUND', `Student with ID ${id} was not found!`)
        }

        return student
    }

    async listStudents(query: ListStudentQuery): Promise<{
        students: StudentWithEnrollmentsModel[],
        pagination: {
            page: number,
            limit: number,
            total: number,
            totalPages: number
        }
    }> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;

        if (page < 1) {
            throw new AppError(400, 'INVALID_PAGE', 'Page must be greater than or equal to 1.');
        }

        if (limit < 1 || limit > 100) {
            throw new AppError(
                400,
                "INVALID_LIMIT",
                "Limit must be between 1 and 100.",
            );
        }

        const result = await this.studentRepository.findMany({
            ...query,
            page,
            limit,
            search: query.search?.trim()
        })

        return {
            students: result.students,
            pagination: {
                page,
                limit,
                total: result.total,
                totalPages: Math.ceil(
                    result.total / limit,
                ),
            },
        }
    }

    async updateStudent(id: number, input: updateStudentInput): Promise<Student> {
        await this.getStudentById(id);
        let nInput: updateStudentInput = {};

        if (input.email !== undefined) {
            this.validateEmail(input.email)

            const normalizedEmail = input.email.trim().toLocaleLowerCase();

            const studentWithEmail =
                await this.studentRepository.findByEmail(
                    normalizedEmail,
                );

            if (
                studentWithEmail &&
                studentWithEmail.id !== id
            ) {
                throw new AppError(
                    409,
                    "STUDENT_EMAIL_ALREADY_EXISTS",
                    "A student with this email already exists.",
                );
            }

            nInput.email = normalizedEmail;
        }

        if (input.fullName !== undefined) {
            this.validateFullName(input.fullName);
            nInput.fullName = input.fullName.trim();
        }

        if (input?.phoneNumber && input.phoneNumber !== undefined) {
            input.phoneNumber =
                nInput?.phoneNumber?.trim() || null;
        }

        return this.studentRepository.update(
            id,
            nInput
        );
    }

    async deleteStudent(id: number): Promise<void> {
        await this.getStudentById(id);
        await this.studentRepository.delete(id);
    }

}