import { UserCreator, UserModel } from "../../models/User";

export interface UserService {
  getUserCount(): Promise<number>;
  create(userCreator: UserCreator): Promise<UserModel>;
  getByEmailAndPassword(email: string, password: string): Promise<UserModel | null>;
}
