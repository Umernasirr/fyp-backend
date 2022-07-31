const mongoose = require('mongoose');

const connectDb = async () => {
  console.log("coming before connect");
  console.log(process.env.MONGO_URI);
  const conn = await mongoose.connect(
    process.env.MONGO_URI,
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    }
  );

  console.log(`MongoDb Connected: ${conn.connection.host}`.cyan.underline.bold);
};

module.exports = connectDb;
