export type Config = {
  secret: string
  port: number
  hashingIterations: number
  https?: {
    useHttps: boolean
    crt: string,
    key: string
  }
  postgres: {
    database: string
    username: string
    password: string
    host: string
    port: number
  }
}
