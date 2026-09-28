import { FindOptionsWhere, Repository } from "typeorm";
import { EnrollmentEntity } from "../../database/entities/enrollment.entity.js";
import { EnrollmentRepository } from "./enrollment.repository.js";
import { CreateEnrollmentInput, ListEnrollmentsQuery } from "./enrollment.dto.js";
import { EnrollmentModel, EnrollmentWithRelationsModel } from "./enrollement.model.js";
import { EnrollmentStatus } from "./enrollment.status.enum.js";

export class TypeOrmEnrollmentRepository implements EnrollmentRepository {

    constructor(private readonly reposotory: Repository<EnrollmentEntity>) { }

    async create(input: CreateEnrollmentInput): Promise<EnrollmentWithRelationsModel> {
        const enrollment = this.reposotory.create({
            studentId: input.studentId,
            courseId: input.courseId
        })

        const savedEnrollment = await this.reposotory.save(enrollment);

        return await this.findRequiredById(
            savedEnrollment.id,
        );
    }

    async findById(id: number): Promise<EnrollmentWithRelationsModel | null> {
        return this.reposotory.findOne({
            where: {
                id
            },
            relations: {
                student: true,
                course: true
            }
        })
    }

    async findByStudentAndCourse(studentId: number, courseId: number): Promise<EnrollmentModel | null> {
        return this.reposotory.findOne({
            where: {
                studentId,
            }
        })

    }

    async findMany(query: ListEnrollmentsQuery): Promise<{ enrollments: EnrollmentWithRelationsModel[], total: number }> {

        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;

        // -------
        const enrolls = await this.reposotory.createQueryBuilder('enrollment')
            .select('enrollment.status', 'status')
            .addSelect('COUNT(enrollment.status)', 'statusCount')
            .groupBy('enrollment.status')
            .having('COUNT(enrollment.status) <  :minCount', {
                minCount: 5
            })
            .getRawMany();

        console.log('enrolls----', enrolls);

        // -----
        const where: FindOptionsWhere<EnrollmentEntity> = {};

        if (query.studentId != undefined) {
            where.studentId = query.studentId
        }

        if (query.courseId !== undefined) {
            where.courseId = query.courseId;
        }

        if (query.status !== undefined) {
            where.status = query.status;
        }

        const [enrollments, total] = await this.reposotory.findAndCount({
            where,
            relations: {
                student: true,
                course: true
            },
            skip,
            take: limit,
            order: {
                createdAt: 'DESC'
            }
        });

        return { enrollments, total }
    } async updateStatus(
        id: number,
        status: EnrollmentStatus,
    ): Promise<EnrollmentWithRelationsModel> {
        const enrollment =
            await this.reposotory.findOneBy({
                id,
            });

        if (!enrollment) {
            throw new Error(
                `Enrollment ${id} was not found.`,
            );
        }

        enrollment.status = status;

        await this.reposotory.save(enrollment);

        return this.findRequiredById(id);
    }

    async delete(id: number): Promise<void> {
        await this.reposotory.findOneBy({
            id,
        });
    }

    async findStudentByCourseId(
        courseId: number,
        options: {
            page: number;
            limit: number;
            status?: EnrollmentStatus;
        },
    ): Promise<{
        enrollments:
        EnrollmentWithRelationsModel[];
        total: number;
    }> {
        const skip =
            (options.page - 1) * options.limit;

        const where:
            FindOptionsWhere<EnrollmentEntity> = {
            courseId,
        };

        if (options.status !== undefined) {
            where.status = options.status;
        }

        const [enrollments, total] =
            await this.reposotory.findAndCount({
                where,
                relations: {
                    student: true,
                    course: true,
                },
                skip,
                take: options.limit,
                order: {
                    createdAt: "DESC",
                },
            });

        return {
            enrollments,
            total,
        };
    }

    private async findRequiredById(
        id: number,
    ): Promise<EnrollmentWithRelationsModel> {
        const enrollment =
            await this.findById(id);

        if (!enrollment) {
            throw new Error(
                `Enrollment ${id} could not be loaded.`,
            );
        }

        return enrollment;
    }
}