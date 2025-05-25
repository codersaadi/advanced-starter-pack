import { users } from '../schemas/user';
import { db } from '../server';

async function main() {
  const userData = {
    email: 'codersaadi@xyz.com',
    // password is codersaadi
    password: '$2a$10$k004FluJIF2/l/ykBZDx6eFqz9SAtxHCNbLsDH3jaOD8x9Meji7/O',
    name: 'Saadi',

    emailVerified: new Date(),
  };

  const [createdUser] = await db
    .insert(users)
    .values(userData)
    .onConflictDoNothing()
    .returning();
  if (!createdUser) throw new Error('error creating user');
}

main();
