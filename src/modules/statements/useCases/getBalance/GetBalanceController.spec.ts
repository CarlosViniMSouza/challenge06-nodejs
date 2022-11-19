import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";
import auth from "../../../../config/auth";

let connection: Connection;

describe("Show a balance", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show a balance", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user",
      email: "user@email.com",
      password: "adm123"
    });

    auth.jwt.secret = "adm123";

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@email.com",
      password: "adm123"
    });

    const { token } = responseToken.body;

    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('balance');
  });

  it("should not be able to show a balance a incorrect token", async () => {
    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer 9989654974`,
    });

    expect(response.status).toBe(401);
  });
});
