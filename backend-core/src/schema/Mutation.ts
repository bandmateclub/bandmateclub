import { gql } from "apollo-server-core";
import { MutationResolvers } from "../generated/graphql";

export const typeDef = gql`
  type Mutation {
    testMut(input: String): String
  }
`;

export const resolvers: MutationResolvers = {
  testMut: () => "hello mutation"
};
