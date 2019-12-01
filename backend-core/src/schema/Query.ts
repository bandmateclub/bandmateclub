import { gql } from "apollo-server-core";
import { AuthorizationError, AuthenticationRequired } from "../models/Errors";
import { PaginationSettings } from "../models/PaginationSettings";

export const typeDef = gql`
  type Query {
  }
`;

export const resolvers = {};
