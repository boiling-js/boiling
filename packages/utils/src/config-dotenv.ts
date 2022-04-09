import dotenv from 'dotenv'
import path from 'path'

const cwd = path.resolve(process.cwd(), '../../')

export const configDotenv = () => {
  dotenv.config({
    path: path.join(cwd, '.env')
  })
  !process.env.NODE_ENV && dotenv.config({
    path: path.join(cwd, `.${ process.env.NODE_ENV }.env`)
  })
}
