/**
 * The Class called Color is use for transform color between RGB,HSV,HEX
 * 0<=R<=255,0<=G<=255,0<=B<=255
 * 0<=H<=360,0<=S<=100,0<=V<=100
 * 0x000000<=HEX<=0xffffff
 * */
export class Color {
	//========================Static Variables========================//

	/**
	 * 0xRrGgBb
	 */
	public static readonly defaultHEX: number = 0x000000;

	/**
	 * vec[R=0~255,G=0~255,B=0~255]
	 */
	public static readonly defaultRGB: Array<number> = Color.HEXtoRGB(Color.defaultHEX);

	/**
	 * vec[H=0~360,S=0~100,V=0~100]
	 */
	public static readonly defaultHSV: Array<number> = Color.RGBtoHSV2(Color.defaultRGB);

	//========================Static Functions========================//
	//====RGB >> HEX====//
	public static RGBtoHEX(R: number, G: number, B: number): number {
		if (isNaN(R + G + B))
			return Color.defaultHEX;
		return Color.snapRGBtoUint(R) << 16 | Color.snapRGBtoUint(G) << 8 | Color.snapRGBtoUint(B);
	}

	public static RGBtoHEX2(RGB: Array<number>): number {
		if (RGB == null ||
			RGB.length != 3)
			return Color.defaultHEX;
		return Color.RGBtoHEX(RGB[0] as number,
			RGB[1] as number,
			RGB[2] as number);
	}

	//====HEX >> RGB====//
	public static HEXtoRGB(I: number): Array<number> {
		let returnVec: Array<number> = new Array<number>(); // fixed length 3
		let Re: number = Color.snapRGB((I >> 16));
		let Gr: number = Color.snapRGB((I & 0x00ff00) >> 8);
		let Bl: number = Color.snapRGB(I & 0x0000ff);
		returnVec[0] = Re;
		returnVec[1] = Gr;
		returnVec[2] = Bl;
		return returnVec;
	}

	//====RGB >> HSV====//
	public static RGBtoHSV(R: number, G: number, B: number): Array<number> {
		// Define Variables
		// Lash Color To 0~100
		let Re: number = Color.snapRGB(R) / 2.55;
		let Gr: number = Color.snapRGB(G) / 2.55;
		let Bl: number = Color.snapRGB(B) / 2.55;
		// Get Report
		let max: number = Math.max(Re, Gr, Bl);
		let min: number = Math.min(Re, Gr, Bl);
		let maxin: number = max - min;
		let H: number = 0, S: number = 0, V: number = 0;
		let returnVec: Array<number> = new Array<number>(); // fixed length 3
		// Set Hue
		if (maxin == 0)
			H = NaN;
		// Set Saturation
		if (isNaN(H))
			S = 0;
		else if (max == Re && Gr >= Bl)
			H = 60 * (Gr - Bl) / maxin + 0;
		else if (max == Re && Gr < Bl)
			H = 60 * (Gr - Bl) / maxin + 360;
		else if (max == Gr)
			H = 60 * (Bl - Re) / maxin + 120;
		else if (max == Bl)
			H = 60 * (Re - Gr) / maxin + 240;
		S = maxin / max * 100;
		// Reset Hue
		if (S == 0)
			H = NaN;
		// Set Brightness
		V = max;
		// Set Return
		returnVec[0] = Color.snapH(H);
		returnVec[1] = Color.snapS(S);
		returnVec[2] = Color.snapV(V);
		return returnVec;
	}

	public static RGBtoHSV2(RGB: Array<number>): Array<number> {
		if (RGB == null ||
			RGB.length != 3)
			return Color.defaultHSV;
		let R: number = RGB[0];
		let G: number = RGB[1];
		let B: number = RGB[2];
		return Color.RGBtoHSV(R, G, B);
	}

	//====HSV >> RGB====//
	public static HSVtoRGB(H: number, S: number, V: number): Array<number> {
		// Define Variables
		let r: number, g: number, b: number;
		let returnVec: Array<number> = new Array<number>(); // fixed length 3
		// Get Report
		let hu: number = Color.snapH(H);
		let sa: number = Color.snapS(S);
		let va: number = Color.snapV(V);
		if (isNaN(hu))
			r = g = b = va / 100;
		else {
			let i: number = Math.floor(hu / 60);
			let f: number = hu / 60 - i;
			let h: number = va / 100;
			let p: number = h * (1 - sa / 100);
			let q: number = h * (1 - f * sa / 100);
			let t: number = h * (1 - (1 - f) * sa / 100);
			switch (i) {
				case 0:
					r = h;
					g = t;
					b = p;
					break;
				case 1:
					r = q;
					g = h;
					b = p;
					break;
				case 2:
					r = p;
					g = h;
					b = t;
					break;
				case 3:
					r = p;
					g = q;
					b = h;
					break;
				case 4:
					r = t;
					g = p;
					b = h;
					break;
				case 5:
					r = h;
					g = p;
					b = q;
					break;
				default:
					throw '没有足够的颜色匹配！'
			}
		}
		r *= 255;
		g *= 255;
		b *= 255;
		// Set Return
		returnVec[0] = Color.snapRGB(r);
		returnVec[1] = Color.snapRGB(g);
		returnVec[2] = Color.snapRGB(b);
		return returnVec;
	}

	public static HSVtoRGB2(HSV: Array<number>): Array<number> {
		if (HSV == null ||
			HSV.length != 3)
			return Color.defaultRGB;
		let H: number = HSV[0];
		let S: number = HSV[1];
		let V: number = HSV[2];
		return Color.HSVtoRGB(H, S, V);
	}

	//====HEX >> HSV====//
	public static HEXtoHSV(I: number): Array<number> {
		return Color.RGBtoHSV2(Color.HEXtoRGB(I));
	}

	//====HSV >> HEX====//
	public static HSVtoHEX(H: number, S: number, V: number): number {
		return Color.RGBtoHEX2(Color.HSVtoRGB(H, S, V));
	}

	public static HSVtoHEX2(HSV: Array<number>): number {
		return Color.RGBtoHEX2(Color.HSVtoRGB2(HSV));
	}

	//====Color Transform====//
	public static turnBrightnessTo(I: number, brightness: number): number {
		return (Number(((I & 0xff0000) >> 16) * brightness) << 16 |
			Number(((I & 0xff00) >> 8) * brightness) << 8 |
			Number((I & 0x0000ff) * brightness));
	}

	//====Some Internal Other Function====//
	//======RGB======//
	private static snapRGB(value: number): number {
		if (isNaN(value))
			return 0;
		return Math.min(Math.max(0, value), 255);
	}

	private static snapRGBtoUint(value: number): number {
		if (isNaN(value))
			return 0;
		return Math.min(Math.max(0, Math.round(value)), 255);
	}

	//======HSV======//
	private static snapH(value: number): number {
		if (isNaN(value))
			return NaN;
		return Math.min(Math.max(0, value % 360), 360);
	}

	private static snapS(value: number): number {
		if (isNaN(value))
			return 0;
		return Math.min(Math.max(0, value), 100);
	}

	private static snapV(value: number): number {
		return Color.snapS(value);
	}
}
