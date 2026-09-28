import { CreateStudentInput, ListStudentQuery, updateStudentInput } from '../student.dto.js';
import { StudentModel, StudentWithEnrollmentsModel } from '../student.model.js';

export interface StudentRepository {

    create(input: CreateStudentInput): Promise<StudentModel>;

    findById(id: number): Promise<StudentWithEnrollmentsModel | null>;

    findByEmail(email: string): Promise<StudentModel | null>;

    findMany(query: ListStudentQuery): Promise<{
        students: StudentWithEnrollmentsModel[],
        total: number
    }>

    update(id: number, input: updateStudentInput): Promise<StudentModel>;

    delete(id: number): Promise<void>
}