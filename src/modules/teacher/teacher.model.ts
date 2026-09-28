export interface TeacherModel {
    id: number;
    email: string;
    fullName: string;
    specialization: string | null;
    createdAt: Date;
    updatedAt: Date;
}