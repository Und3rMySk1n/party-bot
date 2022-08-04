export interface LocalizePluralOptions {
    one: string;
    few: string;
    other: string;
}

export function plural(value: number, options: LocalizePluralOptions): string {
    if (value % 100 > 4 && value % 100 < 20) {
        return options.other;
    }

    const remainder = value % 10;
    switch (remainder) {
        case 1:
            return options.one;
        case 2:
        case 3:
        case 4:
            return options.few;
        default:
            return options.other;
    }
}

export declare type MessageMarkers = {
    [key: string]: string;
};

export function getMessage(text: string, markers: MessageMarkers): string {
    let result = text;
    Object.keys(markers).forEach(key => {
       result = result.replace(`%${key}%`, markers[key]);
    });

    return result;
}