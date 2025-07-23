import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "Files" })
export class FileEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar" })
    destination: string;

    @Column({ type: "varchar" })
    mimetype: string;

    @Column({ type: "int" })
    size: number;

    @Column({ type: "varchar" })
    filename: string;

    @Column({ type: "varchar" })
    originalName: string;

    @Column({ type: "varchar" })
    path: string;
    
    @Column({ type: "date" })
    uploadedAt: Date;
}