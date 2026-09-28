import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EnrollmentEntity } from "./enrollment.entity.js";

@Entity({
    name: 'Course'
})

@Index(
    'UQ_course_code',
    ['code'],
    {
        unique: true
    }
)

@Index(
    'UQ_course_title',
    ['title'],
    {
        unique: true
    }
)

export class CourseEntity {
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id!: number;

    @Column({
        type: 'varchar',
        length: 50
    })
    code!: string;

    @Column({
        type: 'varchar',
        length: 254
    })
    title!: string

    @Column({
        type: 'text',
        nullable: true
    })
    description!: string | null

    @CreateDateColumn({
        type: "datetime",
    })
    createdAt!: Date;

    @OneToMany(() => EnrollmentEntity,
        (enrollement) => enrollement.course
    )
    enrollments!: EnrollmentEntity[]

    @UpdateDateColumn({
        type: "datetime",
    })
    updatedAt!: Date;
}