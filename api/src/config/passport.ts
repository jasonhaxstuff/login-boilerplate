import * as passport from 'passport'
import * as passportLocal from 'passport-local'
import { server } from '..'
import { User } from '../../../database'
import { comparePassword } from '../util'
import { NextFunction } from 'express'
import { Request, Response } from 'express-serve-static-core'

const LocalStrategy = passportLocal.Strategy

passport.serializeUser<User, string>((user, done) => {
  done(undefined, user.id)
})

passport.deserializeUser<User, string>((id: string, done) => {
  server.userService.findById(id)
    .then(user => !user ? done('User not found') : done(undefined, user))
    .catch(err => done(err, undefined))
})

/**
 * Sign in using email and password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  server.userService.findByEmail(email).then(user => {
    if (!user) {
      return done(undefined, undefined, { message: `Email ${email} not found` })
    }

    comparePassword(user.password, password).then(isMatch => {
      if (isMatch) {
        return done(undefined, user)
      }

      return done(undefined, undefined, { message: 'The entered password does not match our records' })
    }).catch(err => done(err))
  }).catch(err => done(err))
}))

/**
 * Login required middleware.
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next()
  }

  res.status(401).json({ errors: [ 'You must be logged in to access this endpoint' ] })
}
