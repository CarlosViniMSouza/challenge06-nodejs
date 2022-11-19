import request from "supertest";
import createConnection from "../../../../database/index";

import { Connection } from "typeorm";
import { app } from "../../../../app";

var connection: Connection;

describe("Create a new user", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/api/v1/users").send({
      name: "user",
      email: "user@email.com",
      password: "adm123"
    });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a new user with user exists", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user",
      email: "user@email.com",
      password: "adm123"
    });

    const response = await request(app).post("/api/v1/users").send({
      name: "user",
      email: "user@email.com",
      password: "adm123"
    });

    expect(response.status).toBe(400);
  });
});
