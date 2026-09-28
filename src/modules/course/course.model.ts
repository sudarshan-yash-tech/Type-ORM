export interface CourseModel {
    id: number;
    code: string;
    title: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}