const Sequelize = require("sequelize");
const { database:{ name, host, user, password } } = require("./config.json");

const sequelize = new Sequelize(name, user, password, {
	host: host,
	dialect: "mysql",
	logging: false
});

const Tags = require("./models/Tags")(sequelize, Sequelize.DataTypes);

module.exports = { Tags };