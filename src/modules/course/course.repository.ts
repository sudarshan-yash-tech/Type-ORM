import { CreateCourseInput, ListCourseQuery, UpdateCourseInput } from "./course.dto.js";
import { CourseModel } from "./course.model.js";

export interface CourseRepository {

    create(input: CreateCourseInput): Promise<CourseModel>;

    findById(id: number): Promise<CourseModel | null>;

    findByCode(code: string): Promise<CourseModel | null>;

    findByTitle(title: string): Promise<CourseModel | null>;

    findMany(query: ListCourseQuery): Promise<{ courses: CourseModel[], count: number }>;

    update(id: number, input: UpdateCourseInput): Promise<CourseModel>

    hasRelatedRecord(id: number): Promise<boolean>;

    delete(id: number): Promise<void>;

}