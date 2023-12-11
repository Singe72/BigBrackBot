const { Sequelize, DataTypes } = require("sequelize");
const { database:{ name, host, username, password } } = require("./config.json");

const sequelize = new Sequelize(name, username, password, {
	host: host,
	dialect: "mysql",
	logging: false
});

const Tags = require("./models/Tags")(sequelize, DataTypes);
const Warns = require("./models/Warns")(sequelize, DataTypes);
const SantaParticipants = require("./models/SantaParticipants")(sequelize, DataTypes);

module.exports = { Tags, Warns, SantaParticipants };