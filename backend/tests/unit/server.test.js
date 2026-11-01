// El servidor usa una conexión simulada durante estas pruebas.
jest.mock('../../config/database', () => jest.fn().mockResolvedValue(undefined));

const { once } = require('node:events');
const mongoose = require('mongoose');
const connectDatabase = require('../../config/database');
const { app, startServer } = require('../../server');
let server;
let baseUrl;

beforeAll(async () => {
  server = await startServer(0, '127.0.0.1');
  expect(connectDatabase).toHaveBeenCalledTimes(1);
  if (!server.listening) await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  if (server?.listening) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test('inicia después de conectar la base de datos', () => {
  expect(server.listening).toBe(true);
});

test('responde la ruta principal cuando la base está desconectada', async () => {
  const response = await fetch(`${baseUrl}/`);
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.message).toBe('Welcome to Task_Management!');
  expect(body.database).toBe('disconnected');
});

test('marca el estado de la API cuando la base está desconectada', async () => {
  const response = await fetch(`${baseUrl}/health`);
  const body = await response.json();

  expect(response.status).toBe(503);
  expect(body).toEqual({ status: 'error', database: 'disconnected' });
});

test('marca el estado de la API cuando la base está conectada', async () => {
  const previousState = Object.getOwnPropertyDescriptor(mongoose.connection, 'readyState');
  const previousName = Object.getOwnPropertyDescriptor(mongoose.connection, 'name');
  Object.defineProperty(mongoose.connection, 'readyState', { configurable: true, value: 1 });
  Object.defineProperty(mongoose.connection, 'name', { configurable: true, value: 'task_management_test' });

  try {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toEqual({ status: 'ok', database: 'task_management_test' });
  } finally {
    if (previousState) Object.defineProperty(mongoose.connection, 'readyState', previousState);
    else delete mongoose.connection.readyState;
    if (previousName) Object.defineProperty(mongoose.connection, 'name', previousName);
    else delete mongoose.connection.name;
  }
});

test('devuelve 404 para rutas que no existen', async () => {
  const response = await fetch(`${baseUrl}/ruta-inexistente`);
  expect(response.status).toBe(404);
  expect(await response.json()).toEqual({ error: 'Invalid Route' });
});

test('devuelve el error de CORS cuando el origen no está permitido', async () => {
  const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
  const warningLog = jest.spyOn(console, 'warn').mockImplementation(() => {});

  const response = await fetch(`${baseUrl}/health`, {
    headers: { Origin: 'https://origen-no-permitido.example' },
  });

  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ message: 'Origin not allowed by CORS' });
  errorLog.mockRestore();
  warningLog.mockRestore();
});

test('registra el error cuando no puede conectar la base de datos', async () => {
  const previousExitCode = process.exitCode;
  const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
  connectDatabase.mockRejectedValueOnce(new Error('MongoDB no disponible'));

  try {
    await expect(startServer(0, '127.0.0.1')).rejects.toThrow('MongoDB no disponible');
    expect(process.exitCode).toBe(1);
  } finally {
    process.exitCode = previousExitCode;
    errorLog.mockRestore();
  }
});
