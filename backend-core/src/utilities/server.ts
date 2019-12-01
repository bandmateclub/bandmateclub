import { ContextFunction } from "apollo-server-core";
import retry from "async-retry";
import chalk from "chalk";
import { Container } from "inversify";
import { config } from "../config";
import { Authentication } from "../models/Authentication";
import { UserService } from "../services/user/UserService";
import { ContextProvider } from "../schema/context";
import { MongoDbConnectionProvider } from "../services/MongoDbConnectionProvider";
import { TYPES } from "../types";
import { createTokenGetter } from "./helpers";

export const bindKnex = async (container: Container, log: any) => {
  if (container.isBound(MongoDbConnectionProvider)) {
    const mongoDbConnectionProvider = container.get<MongoDbConnectionProvider>(MongoDbConnectionProvider);
    const db = await retry(async () => await mongoDbConnectionProvider.getConnection(), {
      retries: 100,
      onRetry: error => {
        log(error);
      }
    });
    const pg = require("knex")({
      client: "pg",
      connection: process.env.PG_CONNECTION_STRING,
      searchPath: ["knex", "public"]
    });
    container.bind<Knex>(TYPES.Knex).toConstantValue(db);
    log(chalk.green("\n  Database connected"));
  }
};

export const createAdminUser = async (userService: UserService) => {
  const userCount = await userService.getUserCount();
  if (userCount === 0) {
    await userService.create({
      email: config.get("defaultUser.email"),
      password: config.get("defaultUser.password")
    });
  }
};

export const createGraphQLContext: (container: Container, model: Authentication) => ContextFunction = (
  container,
  model
) => async ({ req }) => {
  const getToken = createTokenGetter(model);
  const token = await getToken(req.get("Authorization"));

  const authorizationData = token
    ? {
        user: token.user,
        scope: token.scope,
        client: token.client
      }
    : {};

  const tools = container.get<ContextProvider>(TYPES.ContextProvider);
  return {
    ...tools,
    ...authorizationData
  };
};
