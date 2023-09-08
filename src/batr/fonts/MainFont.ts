import { Font } from "../legacy/flash/text";

// import flash.text.Font;

//============Class============//
export default class MainFont extends Font {

    public constructor() {
        super();
    }

    public get fontName(): string {
        return "BaTr Main";
    }

    public get fontStyle(): string {
        return "BaTr Main";
    }

    public get fontType(): string {
        return "BaTr Main";
    }

    public enumerateFont(enumerateDeviceFonts?: boolean | undefined): string[] {
        throw new Error("Method not implemented.");
    }

    public hasGlyphs(str: string): boolean {
        throw new Error("Method not implemented.");
    }

    public registerFont(font: any): void {
        throw new Error("Method not implemented.");
    }

}
