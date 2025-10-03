import { Table, Column, Model, DataType, AllowNull, Validate } from "sequelize-typescript";
import { OrderStatus } from "../../globals/types";

@Table({
    tableName : "orders",
    modelName : "order",
    timestamps : true
})

class Order extends Model{
    @Column({
        primaryKey : true,
        type : DataType.UUID,
        defaultValue : DataType.UUIDV4
    })
    declare id : string

    @Column({
        type : DataType.STRING,
        allowNull : false,
        
        //number validation sets max num 10 and min 10 which gives error msg as well if it does not meet required condtion 
        validate : {
            len :{
                args : [10, 10],
                msg : "phone number must be not less than 10 or more than 10"
            }
        }
    })
    declare phoneNumber : string

    @Column ({
        type : DataType.STRING
    })
    declare AddressLine : string

     @Column ({
        type : DataType.STRING
    })
    declare City : string

     @Column ({
        type : DataType.STRING
    })
    declare State : string

     @Column ({
        type : DataType.STRING,
    })
    declare ZipCode : string


    @Column ({
        type : DataType.FLOAT,
        allowNull : false
    })
    declare totalAmount : number

    @Column ({
        type : DataType.ENUM(OrderStatus.Cancelled, OrderStatus.Delivered, OrderStatus.Ontheway, OrderStatus.Pending, OrderStatus.Preparation),
        defaultValue : OrderStatus.Pending
    })
    declare orderStatus : string

    @Column ({
        type : DataType.STRING,
        allowNull : false,
        defaultValue : "Guest"
    })
    declare firstName : string

     @Column ({
        type : DataType.STRING,
        allowNull : false,
        defaultValue : "User"
    })
    declare lastName : string

     @Column ({
        type : DataType.STRING,
        allowNull : false,
        defaultValue : "GuestUser@gmail.com"
    })
    declare email : string
}


export default Order