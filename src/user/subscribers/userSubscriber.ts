import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';

import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/User';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
  listenTo() {
    return User;
  }

  async beforeInsert(event: InsertEvent<User>) {
    console.log(event.entity);
    if (event.entity.password)
      event.entity.password = await bcrypt.hash(event.entity.password, 12);
  }
}
