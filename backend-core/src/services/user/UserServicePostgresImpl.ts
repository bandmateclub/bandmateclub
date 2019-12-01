import { injectable, inject } from "inversify";
import { UserModel, UserCreator, UserEntity } from "../../models/User";
import { UserService } from "./UserService";
import { comparePassword, hashPassword } from "../../utilities/password";
import Knex, { QueryBuilder } from "knex";
import { TYPES } from "../../types";
import uuid from "uuid";
import { InternalServerError } from "../../models/Errors";

@injectable()
export class UserServicePostgresImpl implements UserService {
  private table: QueryBuilder<UserEntity> = null as any;

  public constructor(@inject(TYPES.Knex) knex: Knex) {
    this.table = knex<UserEntity>("bmc.user");
  }

  private toModel = (entity: UserEntity): UserModel => {
    return {
      id: entity.id.toString(),
      createdAt: entity.createdAt,
      email: entity.email,
      role: entity.role
    };
  };

  public getByEmailAndPassword = async (email: string, password: string): Promise<UserModel | null> => {
    const user = await this.table.where({ email }).first();
    if (user) {
      const passwordCorrect = await comparePassword(password, user.password);
      if (passwordCorrect) {
        return this.toModel(user);
      }
      return null;
    }
    return null;
  };

  public getUserCount = async (): Promise<number> => {
    const result = await this.table.count({ count: "*" });
    if (!result[0]) return 0;

    const count = result[0].count;
    if (!count) return 0;
    if (typeof count === "number") return count;
    return parseInt(count, 10);
  };

  public create = async (userCreator: UserCreator) => {
    const entity = await this.createEntity(userCreator);
    const result = await this.table.insert<{ rowCount: Number }>(entity);
    if (result.rowCount !== 1) throw new InternalServerError("User creation failed");
    return this.toModel(entity);
  };

  private createEntity = async (creator: UserCreator): Promise<UserEntity> => {
    return {
      id: uuid.v4(),
      name: creator.name,
      email: creator.email,
      password: await hashPassword(creator.password),
      role: "admin",
      createdAt: new Date()
    };
  };
}
