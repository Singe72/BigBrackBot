module.exports = (sequelize, DataTypes) => {
	return sequelize.define("giveaways", {
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		message_id: DataTypes.STRING,
		data: DataTypes.JSON
	}, {
		timestamps: false
	});
};