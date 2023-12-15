module.exports = (sequelize, DataTypes) => {
	return sequelize.define("santa_giving", {
		santa_id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		receiver_id: DataTypes.STRING
	}, {
		timestamps: false
	});
};