import { ContextFunction } from "apollo-server-core";
import { Container } from "inversify";
import { config } from "../config";
import { Authentication } from "../models/Authentication";
import { UserService } from "../services/user/UserService";
import { ContextProvider } from "../schema/context";
import { TYPES } from "../types";
import { createTokenGetter } from "./helpers";

export const createAdminUser = async (userService: UserService) => {
  const userCount = await userService.getUserCount();
  if (userCount === 0) {
    await userService.create({
      name: config.get("defaultUser.name"),
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
