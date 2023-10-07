import { Font } from "../../../legacy/flash/text";

//============Class============//
export default class MainFont extends Font {

    public constructor() {
        super();
    }

    public get fontName(): string {
        return "Main Font";
    }

    public get fontStyle(): string {
        return "Main Font";
    }

    public get fontType(): string {
        return "Main Font";
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
