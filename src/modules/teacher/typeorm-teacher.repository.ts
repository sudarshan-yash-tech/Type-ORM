
import {
    Like,
    Repository,
} from "typeorm";
import { TeacherRepository } from "./teacher.repository.js";
import { TeacherEntity } from "../../database/entities/teacher.entity.js";
import { CreateTeacherInput, ListTeachersQuery, UpdateTeacherInput } from "./teacher.dto.js";
import { TeacherModel } from "./teacher.model.js";


export class TypeOrmTeacherRepository
    implements TeacherRepository {
    constructor(
        private readonly repository:
            Repository<TeacherEntity>,
    ) { }

    async create(
        input: CreateTeacherInput,
    ): Promise<TeacherModel> {
        const teacher =
            this.repository.create({
                email: input.email,
                fullName: input.fullName,
                specialization:
                    input.specialization ?? null,
            });

        return this.repository.save(teacher);
    }

    async findById(
        id: number,
    ): Promise<TeacherModel | null> {
        return this.repository.findOneBy({
            id,
        });
    }

    async findByEmail(
        email: string,
    ): Promise<TeacherModel | null> {
        return this.repository.findOneBy({
            email,
        });
    }

    async findMany(
        query: ListTeachersQuery,
    ): Promise<{
        teachers: TeacherModel[];
        total: number;
    }> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;
        const search = query.search?.trim();

        const where = search
            ? [
                {
                    fullName: Like(
                        `%${search}%`,
                    ),
                },
                {
                    email: Like(
                        `%${search}%`,
                    ),
                },
                {
                    specialization: Like(
                        `%${search}%`,
                    ),
                },
            ]
            : undefined;

        const [teachers, total] =
            await this.repository.findAndCount({
                where,
                skip,
                take: limit,
                order: {
                    createdAt: "DESC",
                },
            });

        return {
            teachers,
            total,
        };
    }

    async update(
        id: number,
        input: UpdateTeacherInput,
    ): Promise<TeacherModel> {
        const teacher =
            await this.repository.findOneBy({
                id,
            });

        if (!teacher) {
            throw new Error(
                `Teacher ${id} was not found.`,
            );
        }

        if (input.email !== undefined) {
            teacher.email = input.email;
        }

        if (input.fullName !== undefined) {
            teacher.fullName = input.fullName;
        }

        if (
            input.specialization !== undefined
        ) {
            teacher.specialization =
                input.specialization;
        }

        return this.repository.save(teacher);
    }

    async hasAssignments(
        id: number,
    ): Promise<boolean> {
        const assignmentCount =
            await this.repository
                .createQueryBuilder("teacher")
                .innerJoin(
                    "teacher.assignments",
                    "assignment",
                )
                .where(
                    "teacher.id = :id",
                    { id },
                )
                .getCount();

        return assignmentCount > 0;
    }

    async delete(
        id: number,
    ): Promise<void> {
        await this.repository.delete({
            id,
        });
    }
}
