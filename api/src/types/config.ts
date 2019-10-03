export type Config = {
  secret: string
  port: number,
  postgres: {
    database: string,
    username: string,
    password: string,
    host: string,
    port: number
  }
}
