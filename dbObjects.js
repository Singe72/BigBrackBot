const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("database", "username", "password", {
	host: "localhost",
	dialect: "sqlite",
	logging: false,
	storage: "database.sqlite"
});

const Tags = require("./models/Tags")(sequelize, DataTypes);
const Warns = require("./models/Warns")(sequelize, DataTypes);

module.exports = { Tags, Warns };