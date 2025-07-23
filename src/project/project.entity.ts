import { Column, PrimaryGeneratedColumn, Entity } from "typeorm";

@Entity({ name: "Project" })
export class ProjectEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("text")
    name: string;

    @Column("json")
    links: string[];

    @Column("json")
    contacts: string[]
     
    // @Column("date")
    // createdAt?: Date | null;

    // @Column("date")
    // updatedAt?: Date | null;

    @Column("text")
    status: string;

    @Column("text")
    category: string;

    @Column("text")
    type: string
}