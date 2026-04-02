import * as Joi from 'joi';

export const CreateInstructorSchema = Joi.object({
  instructorName: Joi.string().trim().min(3).required(),

  email: Joi.string().email().required(),

  password: Joi.string().min(6).required(),

  phone: Joi.string()
    .pattern(/^\d+$/)
    .min(7)
    .max(15)
    .required()
    .messages({
      'string.pattern.base': 'Phone must contain only digits',
    }),

  dob: Joi.date().optional(),

  gender: Joi.string()
    .valid('male', 'female', 'other')
    .optional(),

  address: Joi.string().optional(),

  photo_url: Joi.string().uri().optional(),

  year: Joi.number().integer().optional(),
});