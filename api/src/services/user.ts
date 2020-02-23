import { User } from '../../../database'
import { getRepository } from 'typeorm'
import { checkAndEncryptNewPassword, checkAndEncryptPassword } from '../util'

export class UserService {
  private readonly userRepository = getRepository(User)

  public find () {
    return this.userRepository.find()
  }

  public findById (id: string) {
    return this.userRepository.findOne(id)
  }

  /**
   *
   * @param email Sanitize
   */
  public findByEmail (email: string) {
    return this.userRepository.createQueryBuilder('user').where('user.email ILIKE :email', { email: `%${email}%` }).getOne()
  }

  /**
   *
   * @param username Sanitize
   */
  public findByUsername (username: string) {
    return this.userRepository.createQueryBuilder('user').where('user.username ILIKE :username', { username: `%${username}%` }).getOne()
  }

  public async create (user: User) {
    user.dateCreated = new Date()

    if (!(await checkAndEncryptPassword(user))) {
      return false
    }

    await this.userRepository.save(user)
    return true
  }

  public async update (user: User) {
    const oldUser = await this.findById(user.id)

    if (!oldUser) {
      return false
    }

    if (!(await checkAndEncryptNewPassword(oldUser, user))) {
      return false
    }

    await this.userRepository.save(user)
    return true
  }

  public async delete (id: string) {
    const user = await this.userRepository.findOne(id)

    if (!user) {
      return
    }

    await this.userRepository.delete(user)
  }
}
