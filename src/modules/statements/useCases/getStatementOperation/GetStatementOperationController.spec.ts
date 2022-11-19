import request from "supertest";
import { Connection } from "typeorm";
import { app } from "../../../../app";
import createConnection from "../../../../database";
import auth from "../../../../config/auth";

let connection: Connection;

describe("Create a new statement", () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to a get a statement", async () => {
    await request(app).post("/api/v1/users").send({
      name: "user",
      email: "user@email.com",
      password: "adm123"
    });

    auth.jwt.secret = "adm123";

    const responseToken = await request(app).post("/api/v1/sessions").send({
      email: "user@email.com",
      password: "adm123"
    })

    const { token } = responseToken.body

    const responseDeposit = await request(app).post("/api/v1/statements/deposit").send({
      amount: 500,
      description: "deposit test",
    }).set({
      Authorization: `Bearer ${token}`
    });

    const idStatement = responseDeposit.body.id

    const response = await request(app).get(`/api/v1/statements/${idStatement}`).set({
      id: idStatement,
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(200);
  })

  it("should be able to a create a new withdraw", async () => {
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

    const { token } = responseToken.body

    await request(app).post("/api/v1/statements/deposit").send({
      amount: 600,
      description: "deposit test",
    }).set({
      Authorization: `Bearer ${token}`
    });

    const response = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 400,
      description: "withdraw test"
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
  });

  it("should be able to not a create a new withdraw with insufficient balances", async () => {
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

    const { token } = responseToken.body

    await request(app).post("/api/v1/statements/deposit").send({
      amount: 600,
      description: "deposit test",
    }).set({
      Authorization: `Bearer ${token}`
    });

    const response = await request(app).post("/api/v1/statements/withdraw").send({
      amount: 800,
      description: "withdraw test"
    }).set({
      Authorization: `Bearer ${token}`
    });

    expect(response.status).toBe(400);
  });

  it("should not be able to create a new statement a incorrect token", async () => {
    const response = await request(app).get("/api/v1/statements/balance").set({
      Authorization: `Bearer 9989654974`,
    });

    expect(response.status).toBe(401);
  });
});
