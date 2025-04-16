import { z } from 'zod'

// Esquema para validar una fecha individual en formato 'YYYY-MM-DD'
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Debe ser una fecha válida en formato YYYY-MM-DD')
  .refine((date) => !isNaN(Date.parse(date)), {
    message: 'Debe ser una fecha válida',
  })

// Esquema para validar un rango de fechas
const dateRangeSchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  { message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin' },
)

// Función para validar una fecha individual
export const validateDate = (date) => {
  const res = dateSchema.safeParse(date)
  if (!res.success) {
    return { success: false, errors: res.error.errors.map((e) => e.message) }
  }
  return { success: true }
}

// Función para validar un rango de fechas
export const validateDateRange = (data) => {
  const res = dateRangeSchema.safeParse(data)
  if (!res.success) {
    return { success: false, errors: res.error.errors.map((e) => e.message) }
  }
  return { success: true }
}

const yearSchema = z
  .string()
  .regex(/^\d{4}$/, 'El año debe ser un número de 4 dígitos')
  .refine((year) => {
    const numericYear = Number(year) // Convertir el string a número
    return numericYear >= 1900 && numericYear <= new Date().getFullYear()
  }, {
    message: 'El año debe estar entre 1900 y el año actual',
  })

// Función para validar un año
export const validateYear = (year) => {
  const res = yearSchema.safeParse(year)
  if (!res.success) {
    return { success: false, errors: res.error.errors.map((e) => e.message) }
  }
  return { success: true }
}