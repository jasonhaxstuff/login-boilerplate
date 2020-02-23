/**
 * Run `psql <database> < node_modules/connect-pg-simple/table.sql`
 * before starting
 */

import 'reflect-metadata'
import './config/passport'
import { Api } from './api'

export const server = Api.start()
