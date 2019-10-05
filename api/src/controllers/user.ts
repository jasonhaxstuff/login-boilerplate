import { Request, Response, NextFunction } from 'express-serve-static-core'
import { check, sanitize, validationResult } from 'express-validator'
import passport = require('passport')
import { User } from '../../../database'
import { IVerifyOptions } from 'passport-local'
import { replacer as userJsonReplacer, login, comparePassword } from '../util'
import uuid = require('uuid/v4')
import { server } from '..'

export class UserController {
  /**
   * POST /login
   * Sign in using email and password.
   */
  public async postLogin (req: Request, res: Response) {
    await check('email', 'Email is not valid').isEmail().run(req)
    await check('password', 'Password must be between 8 and 160 characters long').isLength({ min: 8, max: 160 }).run(req)
    await sanitize('email').normalizeEmail({ gmail_remove_dots: false }).run(req)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.json({ errors: errors.array().map(e => e.msg) })
      return
    }

    passport.authenticate('local', (err: Error, user: User, info: IVerifyOptions) => {
      if (err) {
        return res.status(500).json({ errors: [ err.message ] })
      }

      if (!user) {
        return res.status(500).json({ errors: [ info.message ] })
      }

      req.logIn(user, err => {
        if (err) {
          return res.status(401).json({ errors: [ 'There was an error saving to your cookies' ] })
        }

        return res.json(JSON.parse(JSON.stringify(user, userJsonReplacer)))
      })

      return
    })(req, res)
  }

  /**
   * GET /logout
   * Logout.
   */
  public getLogout (req: Request, res: Response) {
    req.logOut()
    res.status(200).send()
  }

  /**
   * POST /account
   * Create an account.
   */
  public async postAccount (req: Request, res: Response, next: NextFunction) {
    if (req.body.username !== undefined) {
      await check('username', 'Username must be alphanumeric and 1-20 characters').isAlphanumeric().isLength({ min: 3, max: 20 }).escape().run(req)
    }

    await check('email', 'Email is not valid').isEmail().run(req)
    await check('password', 'Password must be between 8 and 160 characters long').isLength({ min: 8, max: 160 }).run(req)
    await check('confirmPassword', 'Passwords do not match').equals(req.body.password).run(req)
    await sanitize('email').normalizeEmail({ gmail_remove_dots: false }).run(req)

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array().map(e => e.msg) })
    }

    const user = new User()
    user.id = uuid()
    user.email = req.body.email
    user.username = req.body.username !== undefined ? req.body.username : req.body.email
    user.password = req.body.password

    const existing = await server.userService.findByEmail(user.email).catch(() => 'err')

    if (existing) {
      if (existing === 'err') {
        return res.status(500).json({ errors: [ 'Failed while attempting to find duplicate users' ] })
      }

      return res.status(409).json({ errors: [ 'An account with that email address already exists' ] })
    }

    const created = await server.userService.create(user)

    if (!created) {
      return res.status(500).json({ errors: [ 'Failed to create user' ] })
    }

    const error = await login(req, user).catch(err => err)

    if (error && error !== {}) {
      return res.status(500).json({ errors: [ error ] })
    }

    return res.json(JSON.parse(JSON.stringify(user, userJsonReplacer)))
  }

  /**
   * GET /account
   * Profile page.
   */
  public async getAccount (req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ errors: [ 'Not authenticated' ] })
    }

    return res.json(JSON.parse(JSON.stringify(req.user, userJsonReplacer)))
  }

  /**
   * PUT /account
   * Update your account.
   */
  public async putAccount (req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ errors: [ 'Not authenticated' ] })
    }

    if (req.body.username !== undefined) {
      await check('username', 'Username must be alphanumeric and 1-20 characters').isAlphanumeric().isLength({ min: 3, max: 20 }).escape().run(req)
    }

    await check('password', 'The entered password does not match our records').isLength({ min: 8, max: 160 }).run(req)

    if (req.body.editedPassword) {
      await check('editedPassword', 'Password must be between 8 and 160 characters long').isLength({ min: 8, max: 160 }).run(req)
      await check('confirmPassword', 'Passwords do not match').equals(req.body.editedPassword).run(req)
    }

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array().map(e => e.msg) })
    }

    if (!(await comparePassword(req.user.password, req.body.password))) {
      return res.status(409).json({ errors: [ 'The entered password does not match our records' ] })
    }

    const existing = await server.userService.findByUsername(req.body.username)

    if (existing && existing.id !== req.user.id) {
      return res.status(409).json({ errors: [ `User with username '${req.body.username}' already exists` ] })
    }

    if (req.body.username !== undefined) {
      req.user.username = req.body.username
    }

    if (req.body.editedPassword !== undefined) {
      req.user.password = req.body.editedPassword
    }

    const succeeded = await server.userService.update(req.user)

    if (!succeeded) {
      return res.status(500).json({ errors: 'Failed to update user' })
    }

    return res.json(JSON.parse(JSON.stringify(req.user, userJsonReplacer)))
  }
}
