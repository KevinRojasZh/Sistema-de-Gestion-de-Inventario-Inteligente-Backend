import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHass: {
      type: String,
      minLength: 3,
      required: true,
    },
    product: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  { timestamps: true, versionKey: false },
)

userSchema.set('toJSON', {
  transform: (document, retunredObject) => {
    ;((retunredObject.id = retunredObject._id.toString()),
      delete retunredObject._id)
    delete retunredObject.passWordHass
  },
})

const User = mongoose.model('User', userSchema)

export default User
