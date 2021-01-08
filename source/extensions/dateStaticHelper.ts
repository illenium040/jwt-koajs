export { };
import ms from "ms";

export class DateConverter {
    public static convert(value: string | number): Date {
        if (typeof value == 'string')
            return new Date(ms(<string>value));
        else if (typeof value == 'number')
            return new Date(value);

        throw new Error("Conversion failed");
    }

    public static addTimeToNow(value: string | number): Date {
        return new Date(DateConverter.convert(value).getTime() + Date.now());
    }
}