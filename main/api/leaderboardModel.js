const { Sequelize, DataTypes } = require('sequelize');

// Connect to SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './leaderboard.sqlite'
});

// Define schema
const Leaderboard = sequelize.define('leaderboard', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  //json data here
  //Sprint
  sprint: { 
    type: DataTypes.JSON,
    allowNull: false
  },
  //Cheese
  cheese:{
    type: DataTypes.JSON,
    allowNull: false
  },
  //Survival
  survival:{
    type: DataTypes.JSON,
    allowNull: false
  },
  //Ultra
  ultra:{
    type: DataTypes.JSON,
    allowNull: false
  }

}, {
  tableName: 'leaderboard',
  timestamps: false
});

module.exports = { Leaderboard, sequelize };