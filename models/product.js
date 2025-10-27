import mongoose from "mongoose";

const producSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            minLength:3
        },
        price:{
            type:Number,
            required:true,
        },
        stock:{
            type:Number,
            required:true,
        },
        serial_number:{
            type:String,
        },
        description_ia:{
            type:String,
        },
        category_ia:{
            type:String,
        },
        image_url:{
            type:String
        }
    },
    {   timestamps: true,
        versionKey: false,
    }
)

producSchema.set('toJSON',{
    transform:(document,returnedObject) => {
        returnedObject.id= returnedObject._id.toString()
        delete returnedObject._id
    }
})

const Product = mongoose.model('Product', producSchema)


export default Product