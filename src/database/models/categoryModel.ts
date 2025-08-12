

import {Table, Column, Model, DataType, PrimaryKey} from 'sequelize-typescript';

@Table({
    tableName: "categories",
    modelName : "category",
    timestamps: true
})

class Category extends Model {
    @Column({
        primaryKey : true,
        type : DataType.UUID,
        defaultValue : DataType.UUIDV4
    })
    declare id : string;

    //next chai category ko type k ho ta jastai electronics, fashion, grocery, etc.
    @Column({
        type : DataType.STRING,
        allowNull : false // monggose equivalent is required :true
    })
    declare categoryName : string;
}

export default Category;