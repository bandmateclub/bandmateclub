import { injectable } from "inversify";
import knex from "knex";
import { config } from "../config";
import retry from "async-retry";

const databaseUrl = config.get("db.url");

@injectable()
export class KnexProvider {
  private client?: knex = null;

  async connect(): Promise<knex<any, any>> {
    const client = knex({
      client: "pg",
      connection: databaseUrl
    });

    await retry(async () => await client.raw("SELECT 1"), {
      retries: 20,
      onRetry: error => {
        console.error(error);
      }
    });

    return client;
  }
}
