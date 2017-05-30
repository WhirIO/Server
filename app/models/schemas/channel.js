module.exports = (mongoose) => {
  const Schema = mongoose.Schema;
  const schema = new Schema(
    {
      name: {
        type: String,
        trim: true,
        lowercase: true,
        required: true
      },
      description: {
        type: String,
        trim: true,
        default: null
      },
      maxUsers: {
        type: Number,
        default: 100
      },
      connectedUsers: [
        {
          user: {
            type: String,
            required: true
          },
          session: {
            type: String,
            required: true
          },
          meta: {
            joinedOn: {
              type: Date,
              default: Date.now
            }
          }
        }
      ],
      access: {
        public: {
          type: Boolean,
          default: true
        },
        password: {
          type: String,
          default: null
        }
      },
      meta: {
        owner: {
          type: String,
          required: true
        },
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

  schema.statics = {

    connect({ channel = null, session = null }) {
      return this.findOneAndUpdate(
                { name: channel },
        { $setOnInsert: {
          name: channel,
          'meta.owner': session
        } },
                { upsert: true, new: true }
            ).exec();
    },

    fetch({ channel = null }) {
      return this.findOne({ name: channel }).lean().exec();
    },

    update({ channel = null, session = null }, update = '') {
      const query = {
        name: channel
      };

      if (session) {
        query['meta.owner'] = session;
      }

      return this.findOneAndUpdate(query, update).lean().exec();
    },

    removeUser({ channel = null, user = null }) {
      return this.update({ channel }, { $pull: { connectedUsers: { user } } });
    }
  };

  return mongoose.model('Channel', schema, 'channels');
};
