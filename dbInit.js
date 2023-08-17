const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("database", "username", "password", {
	host: "localhost",
	dialect: "sqlite",
	logging: false,
	storage: "database.sqlite"
});

require("./models/Tags")(sequelize, DataTypes);
require("./models/Warns")(sequelize, DataTypes);

const force = process.argv.includes("--force") || process.argv.includes("-f");

sequelize.sync({ force }).then(async () => {
	console.log("Database synced");
	sequelize.close();
}).catch(console.error);