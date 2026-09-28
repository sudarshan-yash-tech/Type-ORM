import { EnrollmentModel, EnrollmentWithRelationsModel } from "./enrollement.model.js";
import { CreateEnrollmentInput, ListEnrollmentsQuery } from "./enrollment.dto.js";
import { EnrollmentStatus } from "./enrollment.status.enum.js";


export interface EnrollmentRepository {
    
    create(input: CreateEnrollmentInput): Promise<EnrollmentWithRelationsModel>;

    findById(id: number): Promise<EnrollmentWithRelationsModel | null>;

    findByStudentAndCourse(studentId: number, courseId: number): Promise<EnrollmentModel | null>;

    findMany(query: ListEnrollmentsQuery): Promise<{
        enrollments: EnrollmentWithRelationsModel[],
        total: number
    }>

    updateStatus(id: number,
        status: EnrollmentStatus
    ): Promise<EnrollmentWithRelationsModel>

    delete(id: number): Promise<void>;

    findStudentByCourseId(courseId: number, options: {
        page: number,
        limit: number,
        status?: EnrollmentStatus
    }): Promise<{
        enrollments: EnrollmentWithRelationsModel[],
        total: number
    }>
}