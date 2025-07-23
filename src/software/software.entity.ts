import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "Software" })
export class SoftwareEntity {
    @PrimaryGeneratedColumn("uuid", { name: "id" })
    id: string;

    @Column("varchar")
    title: string;

    @Column("varchar")
    description: string;
    
    @Column("varchar")
    url: string;
    
    @Column("json")
    containers: string[]

    @Column("simple-array")
    contacts: string[];

    @Column("varchar")
    imageId: string;
}