import {
    CreateTeacherInput,
    ListTeachersQuery,
    UpdateTeacherInput,
} from "./teacher.dto.js";
import { TeacherModel } from "./teacher.model.js";

export interface TeacherRepository {
    create(
        input: CreateTeacherInput,
    ): Promise<TeacherModel>;

    findById(
        id: number,
    ): Promise<TeacherModel | null>;

    findByEmail(
        email: string,
    ): Promise<TeacherModel | null>;

    findMany(
        query: ListTeachersQuery,
    ): Promise<{
        teachers: TeacherModel[];
        total: number;
    }>;

    update(
        id: number,
        input: UpdateTeacherInput,
    ): Promise<TeacherModel>;

    hasAssignments(
        id: number,
    ): Promise<boolean>;

    delete(
        id: number,
    ): Promise<void>;
}