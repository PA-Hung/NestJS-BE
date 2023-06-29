import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    name: string;

    @Prop()
    phone: number;

    @Prop()
    age: string;

    @Prop()
    address: string;

    @Prop()
    createAT: Date;

    @Prop()
    updateAT: Date;

    @Prop()
    isDeleted: boolean;

    @Prop()
    deletedAT: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);