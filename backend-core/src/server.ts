import { ApolloServer } from "apollo-server-express";
import * as bodyParser from "body-parser";
import chalk from "chalk";
import cors from "cors";
import express, { Express } from "express";
import "express-async-errors";
import { Container } from "inversify";
import OAuthServer, { Request, Response } from "oauth2-server";
import * as path from "path";
import { config } from "./config";
import { production } from "./container";
import { errorHandler } from "./middleware/errorHandler";
import { Authentication } from "./models/Authentication";
import { UserService } from "./services/user/UserService";
import schema from "./schema";
import { TYPES } from "./types";
import { createAdminUser, createGraphQLContext } from "./utilities/server";
import { KnexProvider } from "./services/KnexProvider";
import knextype from "knex";

const log = console.log; // tslint:disable-line

type Environment = "production" | "staging" | "development" | "test";

const port = config.get("port");
const host = config.get("host");
const environment: Environment = config.get("environment") as any;

const container = new Container();
container.load(production);

export const createServer = async (callback?: (error?: any, app?: Express) => any) => {
  try {
    const knexProvider = container.get<KnexProvider>(TYPES.KnexProvider);
    const knex = await knexProvider.connect();
    log(chalk.green("\n  Database connected"));

    await knex.migrate.latest({
      directory: path.resolve(__dirname, "./migrations")
    });
    container.bind<knextype<any, any>>(TYPES.Knex).toConstantValue(knex);

    const userService = container.get<UserService>(TYPES.UserService);
    const model = container.get<Authentication>(TYPES.Authentication);

    const initializationPromises = Object.values(TYPES)
      .flatMap(type => container.getAll(type))
      .filter((instance: any) => instance.initiate)
      .map((instance: any) => instance.initiate());

    await Promise.all(initializationPromises);

    await createAdminUser(userService);

    const context = createGraphQLContext(container, model);

    const server = new ApolloServer({
      context,
      schema,
      playground: true,
      introspection: true,
      formatError: (error: any) => {
        console.error(error);
        console.error(error.extensions.exception);
        delete error.extensions.exception;
        return error;
      }
    });

    const app: Express = express();

    const oauth = new OAuthServer({
      model
    });

    /**
     * Express middlewares
     */
    app.use(cors() as any);

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    server.applyMiddleware({ app });
    app.use(errorHandler);

    /**
     * Authentication
     */
    app.post("/oauth2/token", async (req, res) => {
      const response = await oauth.token(new Request(req), new Response(res));
      res.send(response);
    });

    /**
     * Serve images
     */

    app.use("/static", express.static(path.resolve(__dirname, "static")));

    /**
     * Rest of the routes are managed by frontend
     */
    app.use(express.static(path.resolve(__dirname, "../frontend-dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "../frontend-dist", "index.html"));
    });

    /**
     * Start application
     */
    return app.listen(port, host, () => {
      log(
        `\n  ${chalk.gray("App is running at")} ${chalk.cyan("http://%s:%d")} ${chalk.gray("in")} ${chalk.blue(
          "%s"
        )} ${chalk.green("mode")}`,
        host,
        port,
        environment
      );
      log(`  ${chalk.gray("Graphql is running at")} ${chalk.cyan("http://%s:%d%s")}`, host, port, server.graphqlPath);
      log(`  ${chalk.gray("Press")} ${chalk.red("CTRL-C")} ${chalk.gray("to stop.\n")}`);
      if (callback) {
        callback(null, app);
      }
    });
  } catch (error) {
    log(`  ${chalk.red("Application failed to initialize")}`);
    console.error(error.stack);
    if (callback) {
      callback(error);
    }
  }
};
