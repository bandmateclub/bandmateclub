const { cp, rm, cd, exec } = require("shelljs");

cd("../frontend-webapp");
rm("-rf", "node_modules");
exec("yarn --frozen-lockfile");
exec("yarn build");
cd("..");
rm("-rf", "backend-core/frontend-dist");
cp("-R", "frontend-payment/build/", "backend-core/frontend-dist/");
cd("backend-core");
rm("-rf", "node_modules");
exec("yarn --frozen-lockfile");
exec("yarn build");
cd("..");
