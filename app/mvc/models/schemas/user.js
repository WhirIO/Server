'use strict';


module.exports = mongoose => {

    let Schema = mongoose.Schema,
        schema = new Schema(
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
