import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database/index";
import auth from "../../../../config/auth";

var connection: Connection;

describe("Authenticate a user", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate a user", async () => {
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

    expect(responseToken.status).toBe(200);
    expect(responseToken.body).toHaveProperty("token");
  });

  it("should not be able to authenticate a user nonexistent", async () => {
    const response = await request(app).post("/api/v1/sessions").send({
      email: "usernonexistent@email.com",
      password: "adm123"
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate a user incorrect password", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user",
      email: "user@email.com",
      password: "adm123"
    });

    auth.jwt.secret = "adm123";

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@email.com",
      password: "admin12345"
    });

    expect(responseToken.status).toBe(401);
  });

  it("should not be able to authenticate a user incorrect username", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user",
      email: "user@email.com",
      password: "adm123"
    });

    auth.jwt.secret = "adm123";

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "userincorrect@email.com",
      password: "adm123"
    });

    expect(responseToken.status).toBe(401);
  });
});
