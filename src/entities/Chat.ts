import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Message } from './Message';
import { User } from './User';

@Entity({ name: 'chat' })
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  chatName: string;

  @ManyToMany(() => User)
  @JoinTable()
  participants: User[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
