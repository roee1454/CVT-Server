import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("Stock")
export class StockEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column("text")
    systemId: string;

    @Column("int")
    stock: number;

    @Column("boolean")
    instock: boolean;
}