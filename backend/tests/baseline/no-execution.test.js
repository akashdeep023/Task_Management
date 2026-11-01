// Esta prueba auxiliar valida el entorno de medición sin ejecutar módulos de la aplicación.
test('baseline instrumentation runs in the test environment', () => {
  expect(process.env.NODE_ENV).toBe('test');
});
