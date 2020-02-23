import * as argon2 from 'argon2'
import { User } from '../../../database/dist'
import { Request } from 'express-serve-static-core'
import { hashingIterations } from '../api'

export function comparePassword (password: string, canidate: string): Promise<boolean> {
  return argon2.verify(password, canidate, { timeCost: hashingIterations, type: argon2.argon2id })
}

export function encrypt (password: string): Promise<string> {
  return argon2.hash(password, { timeCost: hashingIterations, type: argon2.argon2id })
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

    const started = new Date().getTime()
    const newPassword = await encrypt(newUser.password).catch(err => console.error(err))
    const spent = new Date().getTime() - started

    if (spent < 1000) {
      console.warn(`Took ${spent}ms to hash a password, consider raising the 'hashingIterations' option in config.json`)
    }

    if (spent > 2000) {
      console.warn(`Took ${spent}ms to hash a password, consider lowering the 'hashingIterations' option in config.json`)
    }

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

  const started = new Date().getTime()
  const newPassword = await encrypt(user.password).catch(err => console.error(err))
  const spent = new Date().getTime() - started

  if (spent < 1000) {
    console.warn(`Took ${spent}ms to hash a password, consider raising the 'hashingIterations' option in config.json`)
  }

  if (spent > 2000) {
    console.warn(`Took ${spent}ms to hash a password, consider lowering the 'hashingIterations' option in config.json`)
  }

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
