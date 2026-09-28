import { EnrollmentStatus } from "./enrollment.status.enum.js";

export interface CreateEnrollmentInput {
    studentId: number;
    courseId: number;
}

export interface UpdateEnrollementStatusInput {
    staus: EnrollmentStatus
}

export interface ListEnrollmentsQuery {
    page?: number;
    limit?: number;
    studentId?: number;
    courseId?: number;
    status?: EnrollmentStatus
}