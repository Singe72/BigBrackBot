module.exports = (sequelize, DataTypes) => {
	return sequelize.define("santa_participants", {
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true
		},
		favorite_food: DataTypes.STRING,
		favorite_subject: DataTypes.STRING,
		favorite_movie: DataTypes.STRING,
		favorite_brand: DataTypes.STRING,
		favorite_sport: DataTypes.STRING
	}, {
		timestamps: true,
		updatedAt: false
	});
};