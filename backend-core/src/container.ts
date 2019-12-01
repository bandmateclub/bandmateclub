import { ContainerModule } from "inversify";
import "reflect-metadata";
import { Authentication } from "./models/Authentication";
import { ContextProvider, ContextProviderImpl } from "./schema/context";
import { JwtAuthentication } from "./services/JwtAuthentication";
import { KnexProvider } from "./services/KnexProvider";
import { UserServicePostgresImpl } from "./services/user/UserServicePostgresImpl";
import { TYPES } from "./types";
import { UserService } from "./services/user/UserService";

const production = new ContainerModule(bind => {
  bind<KnexProvider>(TYPES.KnexProvider)
    .to(KnexProvider)
    .inSingletonScope();
  bind<UserService>(TYPES.UserService)
    .to(UserServicePostgresImpl)
    .inSingletonScope();
  bind<Authentication>(TYPES.Authentication)
    .to(JwtAuthentication)
    .inSingletonScope();
  bind<ContextProvider>(TYPES.ContextProvider)
    .to(ContextProviderImpl)
    .inRequestScope();
});

export { production };
