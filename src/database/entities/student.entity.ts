import { Column, CreateDateColumn, Entity, Index, JoinColumn, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EnrollmentEntity } from "./enrollment.entity.js";

@Entity({
    name: 'Student'
})

@Index(
    'UQ_student_email',
    ['email'],
    {
        unique: true
    }
)

export class StudentEntity {
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id!: number;

    @Column({
        type: "varchar",
        length: 254
    })
    email!: string;

    @Column({
        type: 'varchar',
        length: 150
    })
    fullName!: string;

    @Column({
        type: 'varchar',
        length: 30,
        nullable: true
    })
    phoneNumber!: string | null;

    @OneToMany(
        () => EnrollmentEntity,
        (enrollement) => enrollement.student
    )
    enrollments!: EnrollmentEntity[]

    @CreateDateColumn({
        type: 'datetime'
    })
    createdAt!: Date;


    @UpdateDateColumn({
        type: 'datetime'
    })
    updatedAt!: Date;
}