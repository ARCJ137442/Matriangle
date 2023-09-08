
export abstract class Font extends Object {
    public abstract get fontName(): string;
    public abstract get fontStyle(): string;
    public abstract get fontType(): string;

    public abstract enumerateFont(enumerateDeviceFonts?: boolean): Array<string>;
    public abstract hasGlyphs(str: string): boolean;
    public abstract registerFont(font: any): void;

}
