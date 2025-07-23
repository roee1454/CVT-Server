import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "Task" })
export class TaskEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("text")
    userId: string;

    @Column("text")
    title: string;

    @Column("text")
    description: string;

    @Column("text")
    status: string;

    @Column("date")
    dueDate: Date

    @Column("date")
    fromDate: Date
}