import { Entity, PrimaryColumn, Column } from 'typeorm'
import { IsString, IsUUID, IsEmail, IsAlphanumeric, IsDate } from 'class-validator'

@Entity()
export class User {
  @PrimaryColumn('uuid')
  @IsString()
  @IsUUID()
  public id: string

  @Column('varchar')
  @IsString()
  @IsEmail()
  public email: string

  @Column('varchar')
  @IsString()
  @IsAlphanumeric()
  public username: string

  @Column('date')
  @IsDate()
  public dateCreated: Date

  @Column('varchar')
  public password: string
}
