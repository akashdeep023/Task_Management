// La conexión se simula para que las pruebas no dependan de MongoDB.
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: { name: 'task_management_test' },
}));

const mongoose = require('mongoose');
const connectDatabase = require('../../config/database');
const envKeys = ['MONGODB_URI', 'MONGO_URL', 'MONGO_PUBLIC_URL', 'MONGODB_DB_NAME'];
let previousEnv;

beforeEach(() => {
  previousEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  envKeys.forEach((key) => delete process.env[key]);
  mongoose.connect.mockReset();
  mongoose.connect.mockResolvedValue(undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
  envKeys.forEach((key) => {
    if (previousEnv[key] === undefined) delete process.env[key];
    else process.env[key] = previousEnv[key];
  });
});

test('conecta con la dirección principal y el nombre configurado', async () => {
  process.env.MONGODB_URI = 'mongodb://primary.example/task';
  process.env.MONGO_URL = 'mongodb://fallback.example/task';
  process.env.MONGODB_DB_NAME = 'task_management_test';
  jest.spyOn(console, 'log').mockImplementation(() => {});

  await connectDatabase();

  expect(mongoose.connect).toHaveBeenCalledWith('mongodb://primary.example/task', {
    dbName: 'task_management_test',
    serverSelectionTimeoutMS: 10000,
  });
});

test('usa MONGO_URL cuando no hay dirección principal', async () => {
  process.env.MONGO_URL = 'mongodb://fallback.example/task';
  jest.spyOn(console, 'log').mockImplementation(() => {});

  await connectDatabase();

  expect(mongoose.connect).toHaveBeenCalledWith('mongodb://fallback.example/task', {
    dbName: 'task_management',
    serverSelectionTimeoutMS: 10000,
  });
});

test('usa MONGO_PUBLIC_URL como última alternativa', async () => {
  process.env.MONGO_PUBLIC_URL = 'mongodb://public.example/task';
  jest.spyOn(console, 'log').mockImplementation(() => {});

  await connectDatabase();

  expect(mongoose.connect).toHaveBeenCalledWith('mongodb://public.example/task', {
    dbName: 'task_management',
    serverSelectionTimeoutMS: 10000,
  });
});

test('falla con un mensaje claro cuando no hay dirección configurada', async () => {
  await expect(connectDatabase()).rejects.toThrow(
    'MongoDB connection string not configured. Define MONGODB_URI, MONGO_URL or MONGO_PUBLIC_URL.'
  );
  expect(mongoose.connect).not.toHaveBeenCalled();
});
