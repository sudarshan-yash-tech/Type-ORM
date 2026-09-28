export interface StudentModel {
    id: number;
    email: string;
    fullName: string;
    phoneNumber: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface StudentWithEnrollmentsModel
    extends StudentModel {
    enrollmentCount?: number;
    enrollments?: Array<{
        id: number;
        studentId: number;
        courseId: number;
        status: "PENDING" | "COMPLETED" | "DROPPED";
        createdAt: Date;
        updatedAt: Date;
    }>;
}