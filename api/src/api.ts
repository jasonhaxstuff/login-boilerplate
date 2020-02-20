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
import { createServer as createHttpsServer } from 'https'
import { readFileSync } from 'fs'
import { join as joinPaths } from 'path'

let secret = ''
let port = 3000
let httpsConf = {
  useHttps: true,
  crt: './server.crt',
  key: './server.key'
}

let postgres = {
  database: 'login',
  username: 'postgres',
  password: '',
  host: 'localhost',
  port: 5432
}

export let hashingIterations = 3

try {
  const config: Config = require('../config.json')

  secret = config.secret || ''
  port = config.port || 3000
  hashingIterations = config.hashingIterations || 3

  if (config.https) {
    Object.assign(httpsConf, config.https)
  } else {
    httpsConf.useHttps = false
  }

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
    app.use(RateLimit({
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
    app.use((_, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Headers', '*')
      next()
    })
    app.use(
      express.static(joinPaths(process.cwd(), 'public'), { maxAge: 31557600000 }) // 1 year
    )

    // Routes
    app.post('/api/login', this.userController.postLogin)
    app.get('/api/logout', isAuthenticated, this.userController.getLogout)
    app.post('/api/account', this.userController.postAccount)
    app.get('/api/account', isAuthenticated, this.userController.getAccount)
    app.put('/api/account', isAuthenticated, this.userController.putAccount)

    if (!httpsConf.useHttps) {
      app.listen(port)
    } else {
      const cert = readFileSync(joinPaths(process.cwd(), httpsConf.crt), { encoding: 'utf8' })
      const key = readFileSync(joinPaths(process.cwd(), httpsConf.key), { encoding: 'utf8' })
      const httpsServer = createHttpsServer({ cert, key }, app)

      httpsServer.listen(port)
    }

    console.log(`API listening on port ${port}`)
  }
}
