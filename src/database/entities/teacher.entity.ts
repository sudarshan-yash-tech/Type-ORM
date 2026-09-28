import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name: 'Teacher'
})

@Index(
    'UQ_email_key',
    ['email'],
    {
        unique: true
    }
)

export class TeacherEntity {
    @PrimaryGeneratedColumn({
        type: 'int'
    })
    id!: number;

    @Column({
        type: 'varchar',
        length: 254,
        nullable: false
    })
    email!: string;

    @Column({
        type: 'varchar',
        length: 254,
        nullable: false
    })
    fullName!: string

    @Column({
        type: 'varchar',
        length: 254,
        nullable: true
    })
    specialization!: string | null

    //     @OneToMany({
    //         ()=> { TeachingAssignmentEntity }
    //         (assignment) => assignment.teacher
    //     })
    // assignments!: TeachingAssignmentEntity[]

    @CreateDateColumn({
        type: 'datetime'
    })
    createdAt!: Date

    @UpdateDateColumn({
        type: 'datetime'
    })
    updatedAt!: Date
}

