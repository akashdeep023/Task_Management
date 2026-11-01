// Instrumentation probe, NOT an application test and NOT counted in E10.
// No production module is imported: the original suite contained zero tests.
test('baseline instrumentation runs without executing application code', () => {
  expect(true).toBe(true);
});
