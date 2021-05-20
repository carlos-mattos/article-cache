import express from 'express';
import db from './database/connection';

interface UserProps {
  name: string;
}

const app = express();
app.use(express.json());

app.post('/user', (request, response) => {
  const names = request.body;

  names.forEach(async ({ name }: UserProps) => {
    await db('users').insert({ name });
  });

  return response.status(201).send();
});

app.get('/user', async (request, response) => {
  const totalUsers = await db.select().table('users');

  return response.json(totalUsers);
});

app.listen(3333, () => {
  console.log('server is running on 3333!');
});
