import { gql } from "apollo-server-core";
import { QueryResolvers } from "../generated/graphql";

export const typeDef = gql`
  type Query {
    test: String
  }
`;

export const resolvers: QueryResolvers = {
  test: () => "hello world"
};
