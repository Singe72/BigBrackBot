const { Sequelize, DataTypes } = require("sequelize");
const { database:{ name, host, username, password } } = require("./config.json");

const sequelize = new Sequelize(name, username, password, {
	host: host,
	dialect: "mysql",
	logging: false
});

require("./models/Tags")(sequelize, DataTypes);
require("./models/Warns")(sequelize, DataTypes);
require("./models/SantaParticipants")(sequelize, DataTypes);

const force = process.argv.includes("--force") || process.argv.includes("-f");

sequelize.sync({ force }).then(async () => {
	console.log("Database synced");
	sequelize.close();
}).catch(console.error);