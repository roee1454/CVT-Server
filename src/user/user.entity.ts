import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column('text')
    fullName: string;
    @Column({ length: 50 })
    email: string;
    @Column("text")
    hash: string;
    @Column({ length: 30 })
    username: string;
    @Column("text")
    role: "user" | "tech" | "admin"
    @Column("date")
    createdAt: Date
    @Column("boolean")
    active: Boolean
}