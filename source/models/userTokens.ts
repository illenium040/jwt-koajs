import { Document, Model, model, Schema, SchemaType } from "mongoose";
import * as Bcrypt from 'bcrypt';
import { IRefreshToken } from '../tokens/secureTokens';

const hash = (refreshToken: string): string => {
    return Bcrypt.hashSync(refreshToken, Bcrypt.genSaltSync(10));
};

export interface ISecuredRefreshToken extends IRefreshToken {
    userGuid: string;
}

export interface IUserToken extends IRefreshToken {
    readonly accessToken: string;
}

const UserTokenSchema = new Schema({
    userGuid: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true
    },
    expiresDate: {
        type: Date,
        required: true
    }
});


interface IUserTokenDocument extends Document, ISecuredRefreshToken {

}

export interface IUserTokenModel extends Model<IUserTokenDocument> {
    bcryptCompare(userGuid: string, refreshToken: IRefreshToken): Promise<boolean>;
    updateToken(userGuid: string, refreshToken: IRefreshToken): Promise<void>;
    saveToken(userGuid: string, refreshToken: IRefreshToken): Promise<void>;
}

UserTokenSchema.statics.saveToken = async function (userGuid: string, refreshToken: IRefreshToken): Promise<void> {
    const userTokenRecord = await UserTokenModel.create({
        expiresDate: refreshToken.expiresDate,
        value: refreshToken.value,
        userGuid: userGuid.toString()
    });
    await userTokenRecord.validate();
    await userTokenRecord.save();
};

UserTokenSchema.statics.bcryptCompare = async function (userGuid: string, refreshToken: IRefreshToken): Promise<boolean> {
    const hashedToken = await UserTokenModel.findOne({ userGuid: userGuid });
    return await Bcrypt.compare(refreshToken.value, hashedToken?.value!);
};

UserTokenSchema.statics.updateToken = async function (userGuid: string, refreshToken: IRefreshToken): Promise<void> {
    await UserTokenModel.updateOne({ userGuid: userGuid }, {
        value: hash(refreshToken.value)
    });
};

// tslint:disable-next-line:typedef
UserTokenSchema.pre<IUserTokenDocument>("save", async function (next: Function) {
    if (this.isModified("value"))
        this.value = hash(this.value);
    await next();
});

export const UserTokenModel =
    model<IUserTokenDocument, IUserTokenModel>("UserTokens", UserTokenSchema, "UserTokens");