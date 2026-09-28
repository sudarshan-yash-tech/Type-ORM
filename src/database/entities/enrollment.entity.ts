import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { StudentEntity } from "./student.entity.js";
import { CourseEntity } from "./course.entity.js";
import { EnrollmentStatus } from "../../modules/enrollment/enrollment.status.enum.js";

@Entity({
    name: 'Enrollment'
})


@Index(
    'Enrollment_studentId_courseId_key',
    ['studentId', 'courseId'],
    {
        unique: true
    }
)

@Index(
    'Enrollment_course_idx',
    ['courseId']
)

export class EnrollmentEntity {
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id!: number

    @Column({
        type: 'int'
    })
    studentId!: number

    @Column({
        type: 'int'
    })
    courseId!: number

    @ManyToOne(() => StudentEntity,
        (student) => student.enrollments,
        { nullable: false }
    )
    @JoinColumn({
        name: 'studentId',
        referencedColumnName: 'id'
    })
    student!: StudentEntity
    
    @ManyToOne(() => CourseEntity,
        (course) => course.enrollments,
        {
            nullable: false
        })
    @JoinColumn({
        name: 'courseId',
        referencedColumnName: 'id'
    })
    course!: CourseEntity

    @Column({
        type: 'enum',
        enum: EnrollmentStatus,
        default: EnrollmentStatus.PENDING
    })
    status!: EnrollmentStatus

    @CreateDateColumn({
        type: 'datetime',
    })
    createdAt!: Date

    @UpdateDateColumn({
        type: 'datetime'
    })
    updatedAt!: Date
}