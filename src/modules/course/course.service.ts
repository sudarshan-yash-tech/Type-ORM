import { CourseRepository } from "./course.repository.js";
import { CreateCourseInput, ListCourseQuery, UpdateCourseInput } from "./course.dto.js";
import { AppError } from "../../common/errors/AppError.js";
import { CourseModel } from "./course.model.js";

export class CourseService {

    constructor(private readonly courseRepository: CourseRepository) { };
    private normalizeCode(code: string): string {
        const normalizedCode = code.trim().toUpperCase();

        if (!normalizedCode) {
            throw new AppError(
                400,
                "COURSE_CODE_REQUIRED",
                "Course code is required.",
            );
        }

        if (normalizedCode.length > 50) {
            throw new AppError(
                400,
                "COURSE_CODE_TOO_LONG",
                "Course code cannot exceed 50 characters.",
            );
        }

        const validCodePattern = /^[A-Z0-9][A-Z0-9-]*$/;

        if (!validCodePattern.test(normalizedCode)) {
            throw new AppError(
                400,
                "INVALID_COURSE_CODE",
                "Course code may contain only letters, numbers, and hyphens.",
            );
        }

        return normalizedCode;
    }

    private normalizeTitle(title: string): string {
        const normalizedTitle = title.trim();

        if (!normalizedTitle) {
            throw new AppError(
                400,
                "COURSE_TITLE_REQUIRED",
                "Course title is required.",
            );
        }

        if (normalizedTitle.length > 254) {
            throw new AppError(
                400,
                "COURSE_TITLE_TOO_LONG",
                "Course title cannot exceed 254 characters.",
            );
        }

        return normalizedTitle;
    }

    private normalizeOptionalText(
        value?: string,
    ): string | undefined {
        const normalizedValue = value?.trim();
        return normalizedValue || undefined;
    }

    async ensureCodeIsAvailable(code: string): Promise<void> {
        const isCode = await this.courseRepository.findByCode(code);

        if (isCode) {
            throw new AppError(409,
                'COURSE_CODE_ALREADY_EXISTS',
                'A course code with code already exists!')
        }

    }

    async ensureTitleIsAvailable(title: string): Promise<void> {
        const isTitle = await this.courseRepository.findByTitle(title);

        if (isTitle) {
            throw new AppError(409,
                'COURSE_TITLE_ALREADY_EXISTS',
                'A course title already exists'
            )
        }
    }

    async createCourse(input: CreateCourseInput): Promise<CourseModel> {
        const code = this.normalizeCode(input.code);
        const title = this.normalizeTitle(input.title);
        const description =
            this.normalizeOptionalText(
                input.description,
            );

        await Promise.all([await this.ensureCodeIsAvailable(code),
        await this.ensureTitleIsAvailable(title)
        ]);

        return this.courseRepository.create({
            code,
            title,
            description,
        });
    }

    async listCourses(query: ListCourseQuery): Promise<{
        courses: CourseModel[], pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 1;

        if (!Number.isInteger(page) || page < 1) {
            throw new AppError(400,
                'INVALID_PAGE',
                'Page must be a positive integer'
            )
        }

        if (!Number.isInteger(limit) || page < 1 || limit > 100) {
            throw new AppError(400,
                'INVALID_LIMIT',
                'limit must be an integer between 1 and 100'
            )
        }

        const result = await this.courseRepository.findMany({
            page,
            limit,
            search: query.search?.trim()
        })

        return {
            courses: result.courses,
            pagination: {
                page,
                limit,
                total: result.count,
                totalPages: Math.ceil(result.count / limit)
            }
        }
    }

    async getCourseById(
        id: number,
    ): Promise<CourseModel> {
        const course =
            await this.courseRepository.findById(id);

        if (!course) {
            throw new AppError(
                404,
                "COURSE_NOT_FOUND",
                `Course with ID ${id} was not found.`,
            );
        }

        return course;
    }

    async updateCourse(
        id: number,
        input: UpdateCourseInput
    ): Promise<CourseModel> {
        await this.getCourseById(id);

        const updateData: UpdateCourseInput = {};

        if (input.code !== undefined) {
            const code = this.normalizeCode(input.code);

            const existingCourse =
                await this.courseRepository.findByCode(
                    code,
                );

            if (
                existingCourse &&
                existingCourse.id !== id
            ) {
                throw new AppError(
                    409,
                    "COURSE_CODE_ALREADY_EXISTS",
                    "A course with this code already exists.",
                );
            }

            updateData.code = code;
        }

        if (input.title !== undefined) {
            const title =
                this.normalizeTitle(input.title);

            const existingCourse =
                await this.courseRepository.findByTitle(
                    title,
                );

            if (
                existingCourse &&
                existingCourse.id !== id
            ) {
                throw new AppError(
                    409,
                    "COURSE_TITLE_ALREADY_EXISTS",
                    "A course with this title already exists.",
                );
            }

            updateData.title = title;
        }

        if (input.description !== undefined) {
            updateData.description =
                input.description === null
                    ? null
                    : this.normalizeOptionalText(
                        input.description,
                    ) ?? null;
        }

        if (Object.keys(updateData).length === 0) {
            throw new AppError(
                400,
                "NO_COURSE_FIELDS_TO_UPDATE",
                "Provide at least one course field to update.",
            );
        }

        return this.courseRepository.update(
            id,
            updateData,
        );
    }

    async deleteCourse(id: number): Promise<void> {
        await this.getCourseById(id)

        const hasRelatedRecords = await this.courseRepository.hasRelatedRecord(id);

        if (hasRelatedRecords) {
            throw new AppError(409, 'COURSE_HAS_RELATED_RECORDS',
                'This course can not be deleted because has related, students, exams or teaching assignments.'
            )
        }

        await this.courseRepository.delete(id);
    }
}                  