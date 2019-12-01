export interface UserCreator {
  email: string;
  password: string;
}

export interface UserModel {
  id: string;
  email: string;
  createdAt: Date;
  role: string;
}

export interface UserEntity {
  id: string;
  email: string;
  createdAt: Date;
  role: string;
  password: string;
}
