import { isValidEmail } from '.'
import { FieldError } from '../graphql-types'

interface LoginValidation {
  input: 'Email' | 'Username'
  errors: FieldError[] | null
}

export const validateLogin = (emailOrUsername: string, password: string): LoginValidation => {
  const result: LoginValidation = {
    input: 'Email',
    errors: []
  }
  if (emailOrUsername.includes('@')) { // email provided 
    if (!isValidEmail(emailOrUsername)) {
      result.errors!.push({
        field: 'emailOrUsername',
        message: 'Invalid email.'
      })
    }
  }
  else {                               // username provided
    result.input = 'Username'
    if (emailOrUsername.length <= 2) {
      result.errors!.push({
        field: 'emailOrUsername',
        message: 'Username must be longer than 2 characters.'
      })
    }
    if (emailOrUsername.length > 32) {
      result.errors!.push({
        field: 'emailOrUsername',
        message: 'Username must not be longer than 32 characters.'
      })
    }
    if (!/^[A-Za-z0-9_-]*$/.test(emailOrUsername)) {
      result.errors!.push({
        field: 'emailOrUsername',
        message: 'Username must contain only letters, numbers, underscores and dashes.'
      })
    }
  }
  if (password.length < 8) {
    result.errors!.push({
      field: 'password',
      message: 'Password must be at least 8 characters.'
    })
  }
  if (password.length > 128) {
    result.errors!.push({
      field: 'password',
      message: 'Password must not be longer than 128 characters.'
    })
  }
  return {
    input: result.input,
    errors: result.errors!.length > 0 ? result.errors : null
  }
}