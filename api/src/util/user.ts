import * as bcrypt from 'bcrypt-nodejs'
import { User } from '../../../database/dist'
import { Request } from 'express-serve-static-core'

export function comparePassword (password: string, canidate: string): Promise<boolean> {
  return new Promise((res, rej) => {
    bcrypt.compare(canidate, password, (err, isMatch) => {
      if (err) {
        return rej(err)
      }

      return res(isMatch)
    })
  })
}

export function encrypt (password: string): Promise<string> {
  return new Promise((res, rej) => {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        rej(err)
      }

      bcrypt.hash(password, salt, () => { /* none */ }, (err, hash) => {
        if (err) {
          rej(err)
        }

        res(hash)
      })
    })
  })
}

export function replacer (key: string, value: any) {
  if (key === 'password') {
    return undefined
  }

  return value
}

export async function checkAndEncryptNewPassword (oldUser: User, newUser: User) {
  if (oldUser.password !== newUser.password) {
    if (newUser.password.length < 8 || newUser.password.length > 160) {
      return false
    }

    const newPassword = await encrypt(newUser.password).catch(err => console.error(err))

    if (!newPassword) {
      return false
    }

    newUser.password = newPassword
  }

  return true
}

export async function checkAndEncryptPassword (user: User) {
  if (user.password.length < 8 || user.password.length > 160) {
    return false
  }

  const newPassword = await encrypt(user.password).catch(err => console.error(err))

  if (!newPassword) {
    return false
  }

  user.password = newPassword

  return true
}

export function login (req: Request, user: User): Promise<any> {
  return new Promise((res, rej) => {
    req.logIn(user, err => {
      if (err && err !== {}) {
        rej(err)
      }

      res(undefined)
    })
  })
}
