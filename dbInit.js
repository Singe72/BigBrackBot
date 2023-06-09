const Sequelize = require("sequelize");
const { database:{ name, host, user, password } } = require("./config.json");

const sequelize = new Sequelize(name, user, password, {
	host: host,
	dialect: "mysql",
	logging: false
});

require("./models/Tags")(sequelize, Sequelize.DataTypes);
require("./models/Warns")(sequelize, Sequelize.DataTypes);

const force = process.argv.includes("--force") || process.argv.includes("-f");

sequelize.sync({ force }).then(async () => {
	console.log("Database synced");
	sequelize.close();
}).catch(console.error);