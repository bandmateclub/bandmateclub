import { resolver as dateResolver, typeDef as DateType } from "./Date";
import { typeDef as KeyValue } from "./KeyValue";
import { resolver as jsonResolver, typeDef as JsonType } from "./Json";
import { typeDef as ListMetadata } from "./ListMetadata";
import { resolvers as queryResolver, typeDef as Query } from "./Query";
import { resolvers as mutationResolver, typeDef as Mutation } from "./Mutation";
import { makeExecutableSchema } from "graphql-tools";
import { SchemaDefinition } from "./SchemaDefinition";

const resolvers = {
  Query: queryResolver,
  Mutation: mutationResolver,
  Date: dateResolver,
  JSON: jsonResolver
};

const typeDefs = [DateType, JsonType, KeyValue, SchemaDefinition, Query, Mutation, ListMetadata];

export default makeExecutableSchema({ typeDefs, resolvers });
