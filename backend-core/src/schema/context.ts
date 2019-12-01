import { inject, injectable } from "inversify";
import { Client } from "oauth2-server";
import "reflect-metadata";
import { UserModel } from "../models/User";
import { UserService } from "../services/user/UserService";
import { TYPES } from "../types";

export interface ContextProvider {
  userService: UserService;
}

export interface Context {
  userService: UserService;
  user: UserModel;
  client: Client;
  scope?: string;
}

@injectable()
export class ContextProviderImpl implements ContextProvider {
  @inject(TYPES.UserService)
  public userService: UserService = null as any;
}
