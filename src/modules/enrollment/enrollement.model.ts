import type { CourseModel } from "../course/course.model";
import type { StudentModel } from "../student/student.model";
import type { EnrollmentStatus } from "./enrollment-status.enum";

export interface EnrollmentModel {
    id: number;
    studentId: number;
    courseId: number;
    status: EnrollmentStatus;
    createdAt: Date;
    updatedAt: Date;
}

export interface EnrollmentWithRelationsModel
    extends EnrollmentModel {
    student: StudentModel;
    course: CourseModel;
}