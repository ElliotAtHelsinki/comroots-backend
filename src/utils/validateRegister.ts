import { isValidEmail } from '.'
import { FieldError } from '../graphql-types'

export const validateRegister = (email: string, username: string, password: string): FieldError[] | null => {
  const errors: FieldError[] = []
  if (!isValidEmail(email)) {
    errors.push({
      field: 'email',
      message: 'Invalid email.'
    })
  }
  if (username.length <= 2) {
    errors.push({
      field: 'username',
      message: 'Username must be longer than 2 characters.'
    })
  }
  if (username.length > 32) {
    errors.push({
      field: 'username',
      message: 'Username must not be longer than 32 characters.'
    })
  }
  if (!/^[A-Za-z0-9_-]*$/.test(username)) {
    errors.push({
      field: 'username',
      message: 'Username must contain only letters, numbers, underscores and dashes.'
    })
  }
  if (password.length < 8) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters.'
    })
  }
  if (password.length > 128) {
    errors.push({
      field: 'password',
      message: 'Password must not be longer than 128 characters.'
    })
  }
  return errors.length > 0 ? errors : null
}