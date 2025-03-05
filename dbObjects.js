const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const name = process.env.MARIADB_DATABASE;
const username = process.env.MARIADB_USER;
const password = process.env.MARIADB_PASSWORD;

const sequelize = new Sequelize(name, username, password, {
	host: "localhost",
	dialect: "mariadb",
	logging: false
});

const Tags = require("./models/Tags")(sequelize, DataTypes);
const Warns = require("./models/Warns")(sequelize, DataTypes);
const SantaParticipants = require("./models/SantaParticipants")(sequelize, DataTypes);
const SantaGiving = require("./models/SantaGiving")(sequelize, DataTypes);

module.exports = { Tags, Warns, SantaParticipants, SantaGiving };