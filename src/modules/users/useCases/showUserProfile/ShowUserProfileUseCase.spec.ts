import request from "supertest";
import createConnection from "../../../../database/index";
import auth from "../../../../config/auth";

import { Connection } from "typeorm";
import { app } from "../../../../app";

var connection: Connection;

describe("Show user profile", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show a user profile", async () => {
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

    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("email");
  });

  it("should not be able to show a user profile a incorrect token", async () => {
    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer 9989654974`,
    });

    expect(response.status).toBe(401);
  });
});
