// Comprueba que los datos inválidos no lleguen a MongoDB.
jest.mock("../../models/user", () => {
  const User = jest.fn();
  User.findOne = jest.fn();
  User.findById = jest.fn();
  return User;
});

const User = require("../../models/user");
const { registerUser, loginUser } = require("../../controllers/auth");
const { updateUser, updateBoard } = require("../../controllers/user");

const response = () => {
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  return res;
};

beforeEach(() => jest.clearAllMocks());

describe("Validación contra entradas NoSQL", () => {
  test("registro rechaza un correo con operadores", async () => {
    const res = response();
    await registerUser({ body: { name: "Usuario", email: { $ne: null }, password: "Prueba123!" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  test("registro rechaza un nombre que no sea texto", async () => {
    const res = response();
    await registerUser({ body: { name: { $ne: null }, email: "qa@example.com", password: "Prueba123!" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  test("inicio de sesión rechaza un correo con operadores", async () => {
    const res = response();
    await loginUser({ body: { email: { $gt: "" }, password: "Prueba123!" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  test("inicio de sesión rechaza una contraseña que sea objeto", async () => {
    const res = response();
    await loginUser({ body: { email: "qa@example.com", password: { $ne: null } } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findOne).not.toHaveBeenCalled();
  });

  test("actualización de perfil rechaza un correo con operadores", async () => {
    const res = response();
    await updateUser({ user: { id: "abc", email: "qa@example.com" }, body: {
      name: "Usuario", email: { $ne: null }, oldPassword: "Prueba123!", newPassword: "Nueva123!"
    } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findOne).not.toHaveBeenCalled();
    expect(User.findById).not.toHaveBeenCalled();
  });

  test("adición al tablero rechaza un correo con operadores", async () => {
    const res = response();
    await updateBoard({ user: { id: "abc" }, body: { email: { $ne: null } } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("inicio de sesión con datos vacíos devuelve error controlado", async () => {
    const res = response();
    await loginUser({ body: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(User.findOne).not.toHaveBeenCalled();
  });
});
