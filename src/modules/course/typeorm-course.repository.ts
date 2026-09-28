import { Like, Repository } from "typeorm";
import type { CourseRepository } from "./course.repository.js";
import { CourseEntity } from "../../database/entities/course.entity.js";
import { CreateCourseInput, ListCourseQuery, UpdateCourseInput } from "./course.dto.js";
import type { CourseModel } from "./course.model.js";


export class TypeOrmCourseRepository
    implements CourseRepository {
    constructor(
        private readonly repository:
            Repository<CourseEntity>,
    ) { }

    async create(
        input: CreateCourseInput,
    ): Promise<CourseModel> {
        const course =
            this.repository.create({
                code: input.code,
                title: input.title,
                description:
                    input.description ?? null,
                updatedAt: new Date(),
            });

        return this.repository.save(course);
    }

    async findById(
        id: number,
    ): Promise<CourseModel | null> {
        return this.repository.findOneBy({
            id,
        });
    }

    async findByCode(
        code: string,
    ): Promise<CourseModel | null> {
        return this.repository.findOneBy({
            code,
        });
    }

    async findByTitle(
        title: string,
    ): Promise<CourseModel | null> {
        return this.repository.findOneBy({
            title,
        });
    }

    async findMany(
        query: ListCourseQuery,
    ): Promise<{
        courses: CourseModel[];
        count: number;
    }> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;
        const search = query.search?.trim();


        const where = search
            ? [
                {
                    code: Like(
                        `%${search}%`,
                    ),
                },
                {
                    title: Like(
                        `%${search}%`,
                    ),
                },
                {
                    description: Like(
                        `%${search}%`,
                    ),
                },
            ]
            : undefined;

        const [courses, total] =
            await this.repository.findAndCount({
                where,
                skip,
                take: limit,
                order: {
                    createdAt: "DESC",
                },
            });

        return {
            courses,
            count: total,
        };
    }

    async update(
        id: number,
        input: UpdateCourseInput,
    ): Promise<CourseModel> {
        const course =
            await this.repository.findOneBy({
                id,
            });

        if (!course) {
            throw new Error(
                `Course ${id} was not found.`,
            );
        }

        if (input.code !== undefined) {
            course.code = input.code;
        }

        if (input.title !== undefined) {
            course.title = input.title;
        }

        if (input.description !== undefined) {
            course.description =
                input.description;
        }

        return this.repository.save(course);
    }

    async hasRelatedRecord(
        id: number,
    ): Promise<boolean> {

        const result = await this.repository.createQueryBuilder('course')
            .leftJoin('course.enrollments', 'enrollment')
            .select(
                "course.id",
                "courseId",
            )
            .select('COUNT(DISTINCT enrollment.id)', 'enrollmentCount')
            .addSelect(
                "COUNT(DISTINCT enrollment.id)",
                "assignmentCount",
            ).where(
                "course.id = :courseId",
                {
                    courseId: id,
                },
            );

        console.log(result);
        return false;

    }

    async delete(
        id: number,
    ): Promise<void> {
        await this.repository.findOneBy({
            id
        });
    }
}