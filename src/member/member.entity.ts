import { PrimaryGeneratedColumn, Column, Entity } from 'typeorm';

Entity({ name: "members"});
export class MemberEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column("varchar")
    name: string

    @Column("varchar")
    email: string

    @Column("varchar")
    phoneNum: string

    @Column("varchar")
    ad: string
}
