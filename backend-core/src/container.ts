import { ContainerModule } from "inversify";
import "reflect-metadata";
import { Authentication } from "./models/Authentication";
import { ContextProvider, ContextProviderImpl } from "./schema/context";
import { JwtAuthentication } from "./services/JwtAuthentication";
import { KnexProvider } from "./services/KnexProvider";
import { MongoUserService } from "./services/user/MongoUserService";
import { TYPES } from "./types";

const production = new ContainerModule(bind => {
  bind<KnexProvider>(KnexProvider)
    .toSelf()
    .inSingletonScope();
  bind<Authentication>(TYPES.UserService)
    .to(MongoUserService)
    .inSingletonScope();
  bind<Authentication>(TYPES.Authentication)
    .to(JwtAuthentication)
    .inSingletonScope();
  bind<ContextProvider>(TYPES.ContextProvider)
    .to(ContextProviderImpl)
    .inRequestScope();
});

export { production };
