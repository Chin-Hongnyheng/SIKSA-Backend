import * as Joi from 'joi';

export const CreateUserSchema = Joi.object({
  userName: Joi.string().trim().min(3).required(),

  email: Joi.string().email().required(),

  password: Joi.string().min(6).required(),

  phone: Joi.string().pattern(/^\d+$/).min(7).max(15).required().messages({
    'string.pattern.base': 'Phone must contain only digits',
  }),
});
