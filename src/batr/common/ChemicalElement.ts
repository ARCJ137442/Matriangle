import { uint } from "../legacy/AS3Legacy";

export default class ChemicalElement {
	//============Static Variables============//
	protected static readonly ELEMENTS: Array<ChemicalElement> = new Array<ChemicalElement>();

	protected static readonly ZH_CN_ELEMENT_NAME: string = "氢氦锂铍硼碳氮氧氟氖钠镁铝硅磷硫氯氩钾钙钪钛钒铬锰铁钴镍铜锌镓锗砷硒溴氪铷锶钇锆铌钼锝钌铑钯银镉铟锡锑碲碘氙铯钡镧铈镨钕钷钐铕钆铽镝钬铒铥镱镥铪钽钨铼锇铱铂金汞铊铅铋钋砹氡钫镭锕钍镤铀镎钚镅锔锫锎锿镄钔锘铹鈩𨧀𨭎𨨏𨭆䥑鐽錀鎶鉨鈇镆鉝";

	protected static _allowCreate: boolean = false;

	public static readonly isInited: boolean = ChemicalElement.cInit();

	//==============Static Functions==============//
	protected static cInit(): boolean {
		// Begin
		ChemicalElement._allowCreate = true;
		// Start
		ChemicalElement.addElements(
			"H", "He",
			"Li", "Be", "B", "C", "N", "O", "F", "Ne",
			"Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar",
			"K", "Ca",
			"Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn",
			"Ga", "Ge", "As", "Se", "Br", "Kr",
			"Rb", "Sr",
			"Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd",
			"In", "Sn", "Sb", "Te", "I", "Xe",
			"Cs", "Ba",
			"La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu",
			"Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg",
			"Tl", "Pb", "Bi", "Po", "At", "Rn",
			"Fr", "Ra",
			"Ac", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr",
			"Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn",
			"Nh", "Fl", "Mc", "Lv", "Ts", "Og",
		)
		// End
		ChemicalElement._allowCreate = false;
		return true;
	}

	protected static addElement(symbol: string): void {
		let element: ChemicalElement = new ChemicalElement(ChemicalElement.ELEMENTS.length + 1, symbol);
		ChemicalElement.ELEMENTS.push(element);
	}

	protected static addElements(...symbols: string[]): void {
		for (let i: uint = 0; i < symbols.length; i++)
			this.addElement(symbols[i])
	}

	public static getElementFromSample(symbol: string): (ChemicalElement | null) {
		for (let element of ChemicalElement.ELEMENTS) {
			if (element.symbol == symbol)
				return element;
		}
		return null;
	}

	public static getElementFromOrdinal(ordinal: uint): ChemicalElement | null {
		if (ordinal <= ChemicalElement.ELEMENTS.length) {
			return ChemicalElement.ELEMENTS[ordinal - 1];
		}
		return null;
	}

	/**
	 * Get the full element list (copied version)
	 * ! the index is started from 1, not 0
	 */
	public static getElements(): (ChemicalElement | null)[] {
		return [null, ...ChemicalElement.ELEMENTS];
	}

	//============Instance Variables============//
	protected _symbol: string;
	protected _ordinal: uint;

	//============Constructor Function============//
	protected constructor(ordinal: uint, symbol: string) {
		if (!ChemicalElement._allowCreate) {
			throw new Error("Invalid constructor");
		}
		this._symbol = symbol;
		this._ordinal = ordinal;
	}

	//============Instance Getter And Setter============//
	protected get hasCNSample(): Boolean {
		return 0 < this._ordinal && this._ordinal <= ChemicalElement.ZH_CN_ELEMENT_NAME.length;
	}

	public get symbol(): string {
		return this._symbol;
	}

	public get symbol_CN(): string {
		if (this.hasCNSample)
			return ChemicalElement.ZH_CN_ELEMENT_NAME.charAt(this._ordinal - 1);
		return "";
	}

	public get ordinal(): uint {
		return this._ordinal;
	}
	//============Instance Function============//
	public toString(): string {
		return `[Element ${this._symbol}]`;
	}
}
