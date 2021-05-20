import express from 'express';
import db from './database/connection';
import RedisCacheProvider from './redisCacheProvider';

interface UserProps {
  name: string;
}

const app = express();
app.use(express.json());

const redisCacheProvider = new RedisCacheProvider();

const getTotalRowsDB = async () => {
  const [{ total }] = await db('users').count('name', { as: 'total' });
  return total;
};

app.post('/user', async (request, response) => {
  const names: UserProps[] = request.body;

  if (names.length > 0) {
    names.forEach(async ({ name }: UserProps) => {
      await db('users').insert({ name });
    });
  }

  return response.status(201).send();
});

app.get('/user', async (request, response) => {
  const totalRows = await getTotalRowsDB();
  let users = await redisCacheProvider.recover<UserProps[]>(
    `cache-id:${totalRows}`
  );

  if (!users) {
    console.log('aqui');
    users = await db.select().table('users');
    await redisCacheProvider.save(`cache-id:${totalRows}`, users);
  }

  return response.json(users);
});

app.listen(3333, () => {
  console.log('server is running on 3333!');
});
