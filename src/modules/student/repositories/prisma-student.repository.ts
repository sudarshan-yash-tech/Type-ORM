import { Prisma, Student } from "@prisma/client";
import { prisma } from "../../../config/prisma.js";
import { CreateStudentInput, ListStudentQuery, updateStudentInput } from "../student.dto.js";
import { StudentRepository } from "./student.repository.js";
import { StudentWithEnrollmentsModel } from "../student.model.js";

export class PrismaStudentRepository implements StudentRepository {

    async create(input: CreateStudentInput) {
        return prisma.student.create({
            data: {
                email: input.email,
                fullName: input.fullName,
                phoneNumber: input.phoneNumber
            }
        })
    }

    async findById(id: number): Promise<StudentWithEnrollmentsModel | null> {
        return prisma.student.findUnique({
            where: {
                id: id
            }
        })
    }

    async findByEmail(email: string): Promise<Student | null> {
        return prisma.student.findUnique({
            where: {
                email
            }
        })
    }

    async findMany(query: ListStudentQuery): Promise<{
        students: StudentWithEnrollmentsModel[],
        total: number
    }> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;

        const where: Prisma.StudentWhereInput = query.search
            ? {
                OR: [
                    {
                        fullName: {
                            contains: query.search
                        }
                    },
                    {
                        email: {
                            contains: query.search
                        }
                    }
                ]
            }
            : {};

        const [students, total] = await prisma.$transaction(async (tx) => {
            const [studentResults, studentTotal] = await Promise.all([
                tx.student.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' }
                }),
                tx.student.count({ where })
            ]);

            return [studentResults, studentTotal] as const;
        });

        return { students, total };
    }

    async update(id: number, input: updateStudentInput): Promise<Student> {
        return prisma.student.update({
            where: { id },
            data: input
        })
    }

    async delete(id: number): Promise<void> {
        await prisma.student.delete({
            where: { id }
        })
    }
}