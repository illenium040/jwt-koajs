import "../extensions/date";

export interface IToken {
    expiresDate?: Date;
    value: string;
}

/**
 * Base token class
 */
export abstract class Token implements IToken {

    protected _expiresDate: Date;
    protected _value: string;
    protected constructor(value: string, expiresIn: string | number = '30 minutes') {
        this._value = value;
        this._expiresDate = Date.addTimeToNow(expiresIn);
    }

    public get value(): string {
        return this._value;
    }

    public get expiresDate(): Date {
        return this._expiresDate;
    }
}