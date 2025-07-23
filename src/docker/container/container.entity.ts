import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "Container" })
export class ContainerEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("text")
    name: string;z

    @Column("text")
    image: string;

    @Column("text")
    hostPort: string;

    @Column("varchar", { default: "building" })
    state: string;

    @Column("json")
    environmentVariables?: string[];

    @Column("varchar", { default: "" })
    containerId?: string;

    @Column("text")
    buildId: string;

    @Column("text")
    projectId: string;
}