import Joi from 'joi'

export const productValidation = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  price: Joi.number().positive().required(),
  stock: Joi.number().integer().min(0).required(),
  serial_number: Joi.string().alphanum().min(3).max(30).required(),
  category_ia: Joi.string().optional(),
  description_ia: Joi.string().optional(),
})
