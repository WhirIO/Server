'use strict';


module.exports = mongoose => {

    let Schema = mongoose.Schema,
        schema = new Schema(
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
                    default: 1000
                },
                connectedUsers: [
                    {
                        username: {
                            type: String,
                            required: true
                        },
                        socketId: {
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

    return mongoose.model('Channel', schema, 'channels');
};
