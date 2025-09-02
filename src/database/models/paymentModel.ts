import { Table, Column, Model, DataType, AllowNull, Validate, PrimaryKey } from "sequelize-typescript";
import {PaymentMethod, paymentStatus } from "../../globals/types";

@Table({
    tableName : "payment",
    modelName : "payment",
    timestamps : true
})

class Payment extends Model{

    @Column({
        primaryKey : true,
        type : DataType.UUID,
        defaultValue : DataType.UUIDV4
    })
    declare id : string

    @Column ({
        type : DataType.ENUM(PaymentMethod.Esewa, PaymentMethod.Khalti, PaymentMethod.COD),
        defaultValue : PaymentMethod.COD
    })
    declare paymentMethod : string 

    @Column({
        type : DataType.ENUM(paymentStatus.Paid, paymentStatus.Unpaid),
        defaultValue : paymentStatus.Unpaid
    })
    declare paymentStatus : string

}

export default Payment