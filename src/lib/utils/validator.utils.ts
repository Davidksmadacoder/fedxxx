import Joi from 'joi';

export function validator<T>(dtoClass: { validationSchema: Joi.ObjectSchema }, data: T): Joi.ValidationError | null {
  const { error } = dtoClass.validationSchema.validate(data);
  return error || null;
}