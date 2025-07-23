import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "Inquiry" })
export class InquiryEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("text")
    name: string

    @Column("text")
    subject: string;

    @Column("text")
    text: string;

    @Column("text")
    to: string

    @Column("json")
    files: string[]
}