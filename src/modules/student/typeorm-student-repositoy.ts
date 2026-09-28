import { Brackets, Repository } from "typeorm";
import { StudentEntity } from "../../database/entities/student.entity.js";
import { StudentModel, StudentWithEnrollmentsModel } from "./student.model.js";
import { CreateStudentInput, ListStudentQuery, updateStudentInput } from "./student.dto.js";
import { StudentRepository } from "./repositories/student.repository.js";

export class TypeOrmStudentRepository implements StudentRepository {
    constructor(
        private readonly repository: Repository<StudentEntity>,
    ) { }

    async create(input: CreateStudentInput): Promise<StudentModel> {
        const student = this.repository.create({
            email: input.email,
            fullName: input.fullName,
            phoneNumber: input.phoneNumber ?? null,
        });

        return this.repository.save(student);
    }

    async findById(id: number): Promise<StudentWithEnrollmentsModel | null> {
        return this.repository.findOne({
            where: { id },
            relations: { enrollments: true },
        });
    };

    async findByEmail(email: string): Promise<StudentModel | null> {
        return this.repository.findOneBy({
            email
        }
        );
    }

    async findMany(query: ListStudentQuery): Promise<{ students: StudentWithEnrollmentsModel[]; total: number; }> {
        const page = query.page || 1;
        const limit = query.limit || 10;

        const skip = (page - 1) * limit;
        const search = query?.search?.trim();

        const queryBuilder = this.repository
            .createQueryBuilder("student")
            .leftJoinAndSelect("student.enrollments", "enrollments")
            .orderBy("student.createdAt", "DESC")
            .skip(skip)
            .take(limit);

        if (search) {
            queryBuilder.where(
                new Brackets((searchQuery) => {
                    searchQuery
                        .where("student.fullName LIKE :search")
                        .orWhere("student.email LIKE :search");
                }),
                { search: `%${search}%` },
            );
        }

        const [students, total] =
            await queryBuilder.getManyAndCount();

        return { students, total }
    }

    async update(
        id: number,
        input: updateStudentInput
    ): Promise<StudentModel> {
        const student: StudentModel | null = await this.repository.findOneBy({ id });


        if (!student) {
            throw new Error(
                `Student ${id} was not found.`,
            );
        }

        if (input.email !== undefined) {
            student.email = input.email
        }

        if (input.fullName !== undefined) {
            student.fullName = input.fullName;
        }

        if (input.phoneNumber !== undefined) {
            student.phoneNumber =
                input.phoneNumber;
        }

        return this.repository.save(student);
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete({ id })
    }

}