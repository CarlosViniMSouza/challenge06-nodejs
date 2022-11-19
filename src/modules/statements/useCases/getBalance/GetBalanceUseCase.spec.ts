import { AppError } from "../../../../shared/errors/AppError";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";

import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";

var getBalanceUseCase: GetBalanceUseCase
var statementsRepositoryInMemory: InMemoryStatementsRepository
var usersRepositoryInMemory: InMemoryUsersRepository
var createUserUseCase: CreateUserUseCase

describe("List a get balance", () => {

  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();

    usersRepositoryInMemory = new InMemoryUsersRepository();

    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory, usersRepositoryInMemory
    );

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to get user balance ", async () => {
    const user: ICreateUserDTO = {
      name: "user",
      email: "user@email.com",
      password: "adm123"
    };

    const userCreated = await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password
    });

    const userBalance = await getBalanceUseCase.execute({ user_id: userCreated.id as string });

    expect(userBalance).toHaveProperty("statement");
    expect(userBalance).toHaveProperty("balance");
  });

  it("should not be able to authenticate for user non existant", async () => {
    expect(async () => {
      const balance = await getBalanceUseCase.execute({
        user_id: "id1234IsInvalid"
      });

    }).rejects.toBeInstanceOf(AppError);
  });
});
