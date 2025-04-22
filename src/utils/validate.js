import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

/**
 * Valida datos contra un esquema Zod
 * @param {z.ZodSchema} schema - Esquema Zod para validación
 * @param {unknown} data - Datos a validar
 * @returns {object} - Objeto con { success: boolean, data?: any, error?: string }
 */
export const validate = (schema, data) => {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const validationError = fromZodError(result.error);
    return {
      success: false,
      error: validationError.message
    };
  }

  return {
    success: true,
    data: result.data
  };
};

// Esquemas comunes
export const schemas = {
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  id: z.string().uuid('ID inválido'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres')
};

// Validadores predefinidos
export const validators = {
  email: (email) => validate(schemas.email, email),
  password: (password) => validate(schemas.password, password),
  id: (id) => validate(schemas.id, id),
  name: (name) => validate(schemas.name, name)
};

export default {
  validate,
  schemas,
  validators
};
