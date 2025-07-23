import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'Future Project' })
export class FutureProjectEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column("text")
    title: string;
    @Column("text")
    description: string;
    @Column("json")
    contacts: string[];
    @Column("json")
    links: string[];
    @Column("text")
    status: string;
    @Column('text')
    category: string;
    @Column("text")
    type: string;
}