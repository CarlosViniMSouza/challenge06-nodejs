import auth from "../../../../config/auth";

import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

var authenticateUserUseCase: AuthenticateUserUseCase
var usersRepositoryInMemory: InMemoryUsersRepository
var createUserUseCase: CreateUserUseCase

describe("Authenticate User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);

    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepositoryInMemory);
  })

  it("should be able to authenticate an user", async () => {
    const user: ICreateUserDTO = {
      name: "user",
      email: "user@email.com",
      password: "adm123"
    };

    await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password
    });

    auth.jwt.secret = user.password;

    const Authentication = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(Authentication).toHaveProperty("token");
  });

  it("should not be able to authenticate with incorrect password", () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "user@email.com",
        password: "adm123",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to authenticate with incorrect password", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "user",
        email: "user@email.com",
        password: "adm123"
      };

      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password,
      });

      await authenticateUserUseCase.execute({
        email: user.email,
        password: "adm123",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
