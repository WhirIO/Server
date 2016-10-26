'use strict';


module.exports = mongoose => {

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
                default: 1000
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

    return mongoose.model('Channel', schema, 'channels');
};
