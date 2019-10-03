import * as RateLimit from 'express-rate-limit'
import bodyParser = require('body-parser')
import express = require('express')
import session = require('express-session')
import passport = require('passport')
import Store = require('connect-pg-simple')
import { createConnection } from 'typeorm'
import { Config } from './types'
import { UserService } from './services'
import { UserController } from './controllers'
import { User } from '../../database/dist'
import { isAuthenticated } from './config/passport'

let secret = ''
let port = 3000
let postgres = {
  database: 'login',
  username: 'postgres',
  password: '',
  host: 'localhost',
  port: 5432
}

try {
  const config: Config = require('../config.json')
  secret = config.secret
  port = config.port
  Object.assign(postgres, config.postgres)
} catch (err) {
  console.error(err)
}

export class Api {
  public static start (): Api {
    return new Api()
  }

  public userService: UserService
  public userController: UserController

  constructor () {
    this.init().catch(err => console.error(err))
  }

  private async init () {
    const connection = await createConnection({
      type: 'postgres',
      database: postgres.database,
      username: postgres.username,
      password: postgres.password,
      host: postgres.host,
      port: postgres.port,
      entities: [ User ]
    }).catch(err => console.error(err))

    if (!connection) {
      console.log('exiting due to fatal error')
      return
    }

    this.userService = new UserService()
    this.userController = new UserController()

    this.startServer()
  }

  private startServer () {
    const app = express()

    app.set('port', port)

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(session({
      store: new (Store(session))(),
      secret,
      resave: true,
      saveUninitialized: true,
      cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(new RateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 100,
      skip: (request: express.Request) => {
        if (request.ip === '::1' || request.ip === '::ffff:127.0.0.1') {
          return true
        }

        return false
      }
    }))
    app.use((req, res, next) => {
      res.locals.user = req.user
      next()
    })

    // Routes
    app.post('/login', this.userController.postLogin)
    app.get('/logout', isAuthenticated, this.userController.getLogout)
    app.post('/account', this.userController.postAccount)
    app.get('/account', isAuthenticated, this.userController.getAccount)
    app.put('/account', isAuthenticated, this.userController.putAccount)

    app.listen(port)
    console.log(`App running on port ${port}`)
  }
}
