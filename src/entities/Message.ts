import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';
import { Chat } from './Chat';

@Entity({ name: 'message' })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;
  @ManyToOne(() => User, (user) => user.messages)
  sender: User;

  @Column()
  senderName: string;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;
}
