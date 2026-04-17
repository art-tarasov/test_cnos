import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Quiz } from './quiz.entity';

export enum UserRole {
  ADMIN = 'admin',
  AUTHOR = 'author',
  PARTICIPANT = 'participant',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PARTICIPANT })
  role!: UserRole;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany('Quiz', (quiz: Quiz) => quiz.author)
  quizzes!: Quiz[];
}
