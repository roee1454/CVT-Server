import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

interface Contact {
    name: string;
    email: string;
    phoneNum: string;
}

@Entity({ name: "system" })
export class SystemEntity {
    @PrimaryGeneratedColumn("uuid", { name: "id" })
    id: string;

    @Column("varchar")
    title: string;

    @Column("varchar")
    descripion: string;
    
    @Column("json")
    contacts: Contact[];

    @Column("varchar")
    imageId: string;
};