module.exports = (mongoose) => {
  const schema = new mongoose.Schema(
    {
      username: {
        type: String,
        trim: true,
        lowercase: true,
        default: null
      },
      gender: {
        type: String,
        default: null
      },
      age: {
        type: String,
        default: null
      },
      meta: {
        createdOn: {
          type: Date,
          default: Date.now
        }
      }
    },
    {
      strict: true,
      versionKey: false
    }
  );

  return mongoose.model('User', schema, 'users');
};
