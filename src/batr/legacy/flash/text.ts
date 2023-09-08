
export declare class Font extends Object {
    public get fontName(): string;
    public get fontStyle(): string;
    public get fontType(): string;

    public enumerateFonts(enumerateDeviceFonts?: boolean): Array<string>;
    public hasGlyphs(str: string): boolean;
    public registerFont(font: any): void;
}
