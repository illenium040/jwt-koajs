import ms from "ms";

declare global {
    // tslint:disable-next-line:interface-name
    interface DateConstructor {
        convert(value: string | number): Date;
        addTimeToNow(value: string | number): Date;
    }
}

Date.convert = function (value: string | number): Date {
    if (typeof value == 'string')
        return new Date(ms(<string>value));
    else if (typeof value == 'number')
        return new Date(value);

    throw new Error("Conversion failed");
};

Date.addTimeToNow = function (value: string | number): Date {
    return new Date(this.convert(value).getTime() + Date.now());
};

