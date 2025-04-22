import Joi from 'joi';

export const userSchema = {
  create: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role_id: Joi.number().integer().positive().required(),
    company_id: Joi.number().integer().positive().required()
  }),

  update: Joi.object({
    username: Joi.string().alphanum().min(3).max(30),
    email: Joi.string().email(),
    password: Joi.string().min(8),
    role_id: Joi.number().integer().positive(),
    company_id: Joi.number().integer().positive()
  }).min(1)
};
