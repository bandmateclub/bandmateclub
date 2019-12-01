import * as Knex from "knex";

export async function up(knex: Knex): Promise<any> {
  await knex.raw(`CREATE SCHEMA IF NOT EXISTS bmc`);
  await knex.schema.withSchema("bmc").createTable("user", function(table) {
    table.uuid("id").primary();
    table.string("name", 255).notNullable();
    table
      .string("email", 255)
      .unique()
      .index();
    table.string("password", 255).notNullable();
    table.enum("role", ["admin"]).notNullable();
    table.timestamp("createdAt").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<any> {
  await knex.schema.withSchema("bmc").dropTableIfExists("user");
}
