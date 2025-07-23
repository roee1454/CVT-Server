import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "Spec" })
export class SpecEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("text")
    title: string;

    @Column("text")
    category: string;

    @Column("text")
    type: string;

    @Column("date")
    date: Date;
}