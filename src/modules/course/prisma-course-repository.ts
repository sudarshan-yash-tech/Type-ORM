import { Course, Prisma } from "@prisma/client";
import { CreateCourseInput, ListCourseQuery, UpdateCourseInput } from "./course.dto.js";
import { CourseRepository } from "./course.repository.js";
import { prisma } from "../../config/prisma.js";

export class PrismaCourseRepository implements CourseRepository {

    async create(input: CreateCourseInput): Promise<Course> {
        return prisma.course.create({
            data: {
                code: input.code,
                title: input.title,
                description: input.description
            }
        })
    }

    async findById(id: number): Promise<Course | null> {
        return prisma.course.findUnique({
            where: { id }
        })
    }

    async findByCode(code: string): Promise<Course | null> {
        return prisma.course.findUnique({
            where: {
                code
            }
        })
    }

    async findByTitle(title: string): Promise<Course | null> {
        return prisma.course.findUnique({
            where: {
                title
            }
        })
    }

    async findMany(query: ListCourseQuery): Promise<{ courses: Course[], count: number }> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * 10;

        const search = query?.search?.trim()

        const where: Prisma.CourseWhereInput = search ? {
            OR: [
                {
                    code: {
                        contains: search
                    }
                },
                {
                    title: {
                        contains: search
                    }
                },
                {
                    description: {
                        contains: search
                    }
                }
            ]
        } : {}

        const [courses, total] = await prisma.$transaction(async (tx) => {
            const [courses, total] = await Promise.all([
                tx.course.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: {
                        createdAt: 'desc'
                    }
                }),

                tx.course.count({
                    where
                })

            ]);

            return [
                courses,
                total
            ] as const
        })

        return { courses, count: total }
    }

    async update(id: number, input: UpdateCourseInput): Promise<Course> {
        return prisma.course.update({
            where: { id },
            data: input
        })
    }

    async hasRelatedRecord(id: number): Promise<boolean> {
        const course = await prisma.course.findUnique({
            where: { id },
            select: {
                _count: {
                    select: {
                        enrollments: true,
                        assignments: true,
                        exams: true
                    }
                }
            }
        });

        if (!course) {
            return false
        }

        return (
            course._count.enrollments > 0 ||
            course._count.assignments > 0 ||
            course._count.exams > 0
        );
    }

    async delete(id: number): Promise<void> {
        prisma.course.delete({
            where: {
                id
            }
        })
    }


}