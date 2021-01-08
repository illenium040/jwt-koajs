import mongoose = require("mongoose");

export async function connect(): Promise<void> {
    await mongoose.connect(<string>process.env.CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
    });
}
