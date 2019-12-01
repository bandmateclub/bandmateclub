import convict from "convict";
import { isNonProduction } from "../utilities/helpers";

convict.addFormat({
  name: "clients-array",
  coerce: (value: string) => JSON.parse(value),
  validate: (value: any) => {
    if (!Array.isArray(value)) {
      throw new Error("Clients should be an array");
    }
    const isValid = value.every(client =>
      ["id", "secret", "grants", "accessTokenLifetime", "refreshTokenLifetime"].every(key => key in client)
    );

    if (!isValid) {
      throw new Error(
        "Invalid clients format. Clients should have id, secret, grants, accessTokenLifetime and refreshTokenLifetime"
      );
    }
  }
});

const config = convict({
  environment: {
    doc: "The application environment.",
    format: ["production", "staging", "development", "test"],
    default: "production",
    env: "NODE_ENV"
  },
  host: {
    doc: "The IP address to bind.",
    format: "ipaddress",
    default: "0.0.0.0",
    env: "HOST"
  },
  port: {
    doc: "The port to bind.",
    format: "port",
    default: 8080,
    env: "PORT"
  },
  db: {
    url: {
      doc: "Database connection url",
      format: String,
      default: null,
      env: "DATABASE_URL"
    }
  },
  clients: {
    doc: "Clients",
    format: "clients-array",
    default: null,
    env: "CLIENTS"
  },
  defaultUser: {
    email: {
      doc: "User email to create if no user exists",
      format: String,
      default: "info@bandmate.club",
      env: "DEFAULT_USER_EMAIL"
    },
    password: {
      doc: "User password to create if no user exists",
      format: String,
      default: null,
      env: "DEFAULT_USER_PASSWORD"
    }
  },
  jwt: {
    issuer: {
      doc: "JWT Issuer",
      format: String,
      default: "bandmateclub",
      env: "JWT_ISSUER"
    },
    audience: {
      doc: "JWT Audience",
      format: String,
      default: "bandmateclub-users",
      env: "JWT_AUDIENCE"
    },
    subject: {
      doc: "JWT Subject",
      format: String,
      default: "login",
      env: "JWT_SUBJECT"
    },
    secret: {
      doc: "JWT Secret",
      format: String,
      default: null,
      env: "JWT_SECRET"
    },
    accessTokenLifetime: {
      doc: "Access token lifetime in seconds (clients setting overrides this value)",
      format: "int",
      default: 24 * 60 * 60
    },
    refreshTokenLifetime: {
      doc: "Refresh token lifetime in seconds (clients setting overrides this value)",
      format: "int",
      default: 3 * 24 * 60 * 60
    }
  }
});

if (["development", "test", "staging"].includes(config.get("environment"))) {
  config.set("db.url", "postgresql://bandmate_user:bandmate_password@localhost:27017/bandmate");
  config.set("jwt.secret", "secret");
  config.set("defaultUser.password", "123456");
  config.set(
    "clients",
    JSON.stringify([
      {
        id: "iframe",
        secret: "123456",
        grants: ["password", "refresh_token"],
        accessTokenLifetime: 60 * 60,
        refreshTokenLifetime: 24 * 60 * 60
      }
    ])
  );
}

// Perform validation
config.validate({ allowed: "strict" });

export { config };
