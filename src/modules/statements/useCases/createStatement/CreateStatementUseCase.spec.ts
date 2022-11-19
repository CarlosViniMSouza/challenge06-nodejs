import { AppError } from "../../../../shared/errors/AppError";

import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";

import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

import { OperationType } from "../../entities/Statement";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";


var createStatementUseCase: CreateStatementUseCase
var statementsRepositoryInMemory: InMemoryStatementsRepository
var usersRepositoryInMemory: InMemoryUsersRepository
var createUserUseCase: CreateUserUseCase

describe("Create Statement", () => {

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory, statementsRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to create a new deposit ", async () => {
    var user: ICreateUserDTO = {
      name: "user",
      email: "user@email.com.br",
      password: "adm123"
    };

    var userCreated = await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password
    });

    var createStatement = await createStatementUseCase.execute({
      user_id: userCreated.id as string,
      type: OperationType.DEPOSIT,
      amount: 12500,
      description: "test"
    });

    expect(createStatement).toHaveProperty("id");
    expect(createStatement).toHaveProperty("type", "deposit");
  });

  it("should be able to carry out a withdraw ", async () => {
    var user: ICreateUserDTO = {
      name: "user",
      email: "user@email.com.br",
      password: "adm123"
    };

    var userCreated = await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password
    });

    var createDeposit = await createStatementUseCase.execute({
      user_id: userCreated.id as string,
      type: OperationType.DEPOSIT,
      amount: 12500,
      description: "test"
    });

    var createWithdraw = await createStatementUseCase.execute({
      user_id: userCreated.id as string,
      type: OperationType.WITHDRAW,
      amount: 1250,
      description: "test"
    });

    expect(createDeposit).toHaveProperty("id");

    expect(createDeposit).toHaveProperty("type", "deposit");

    expect(createWithdraw).toHaveProperty("id");

    expect(createWithdraw).toHaveProperty("type", "withdraw");
  });

  it("should not be able to make a withdrawal with insufficient balance", async () => {
    expect(async () => {
      var user: ICreateUserDTO = {
        name: "user",
        email: "user@email.com",
        password: "123"
      };

      var userCreated = await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password
      });

      await createStatementUseCase.execute({
        user_id: userCreated.id as string,
        type: OperationType.WITHDRAW,
        amount: 1000,
        description: "testIncorrect"
      });

    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to create new statement for user non existant", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "id1234IsInvalid",
        type: OperationType.DEPOSIT,
        amount: 1450,
        description: "error"
      });

    }).rejects.toBeInstanceOf(AppError)
  });
});
