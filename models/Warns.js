module.exports = (sequelize, DataTypes) => {
	return sequelize.define("warns", {
		warn_id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		user_id: DataTypes.STRING,
		reason: DataTypes.TEXT,
		author_id: DataTypes.STRING
	});
};