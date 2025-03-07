const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const name = process.env.MARIADB_DATABASE;
const username = process.env.MARIADB_USER;
const password = process.env.MARIADB_PASSWORD;

const sequelize = new Sequelize(name, username, password, {
	host: "mariadb",
	dialect: "mariadb",
	logging: false
});

require("./models/Tags")(sequelize, DataTypes);
require("./models/Warns")(sequelize, DataTypes);
require("./models/SantaParticipants")(sequelize, DataTypes);
require("./models/SantaGiving")(sequelize, DataTypes);

const force = process.argv.includes("--force") || process.argv.includes("-f");

sequelize.sync({ force }).then(async () => {
	console.log("Database synced");
	sequelize.close();
}).catch(console.error);