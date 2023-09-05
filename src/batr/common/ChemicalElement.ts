export default class ChemicalElement {
	//============Static Variables============//
	private static readonly ELEMENTS: Array<ChemicalElement> = new Array<ChemicalElement>();

	private static readonly ZH_CN_ELEMENT_NAME: String = "氢氦锂铍硼碳氮氧氟氖钠镁铝硅磷硫氯氩钾钙钪钛钒铬锰铁钴镍铜锌镓锗砷硒溴氪铷锶钇锆铌钼锝钌铑钯银镉铟锡锑碲碘氙铯钡镧铈镨钕钷钐铕钆铽镝钬铒铥镱镥铪钽钨铼锇铱铂金汞铊铅铋钋砹氡钫镭锕钍镤铀镎钚镅锔锫锎锿镄钔锘铹鈩𨧀𨭎𨨏𨭆䥑鐽錀鎶鉨鈇镆鉝";

	private static _allowCreate: boolean = false;

	public static readonly isInited: boolean = ChemicalElement.cInit();

	//==============Static Functions==============//
	private static cInit(): boolean {
		// Begin
		ChemicalElement._allowCreate = true;
		// Start
		ChemicalElement.addElement("H");
		ChemicalElement.addElement("He");
		ChemicalElement.addElement("Li");
		ChemicalElement.addElement("Be");
		ChemicalElement.addElement("B");
		ChemicalElement.addElement("C");
		ChemicalElement.addElement("N");
		ChemicalElement.addElement("O");
		ChemicalElement.addElement("F");
		ChemicalElement.addElement("Ne");
		ChemicalElement.addElement("Na");
		ChemicalElement.addElement("Mg");
		ChemicalElement.addElement("Al");
		ChemicalElement.addElement("Si");
		ChemicalElement.addElement("P");
		ChemicalElement.addElement("S");
		ChemicalElement.addElement("Cl");
		ChemicalElement.addElement("Ar");
		ChemicalElement.addElement("K");
		ChemicalElement.addElement("Ca");
		ChemicalElement.addElement("Sc");
		ChemicalElement.addElement("Ti");
		ChemicalElement.addElement("V");
		ChemicalElement.addElement("Cr");
		ChemicalElement.addElement("Mn");
		ChemicalElement.addElement("Fe");
		ChemicalElement.addElement("Co");
		ChemicalElement.addElement("Ni");
		ChemicalElement.addElement("Cu");
		ChemicalElement.addElement("Zn");
		ChemicalElement.addElement("Ga");
		ChemicalElement.addElement("Ge");
		ChemicalElement.addElement("As");
		ChemicalElement.addElement("Se");
		ChemicalElement.addElement("Br");
		ChemicalElement.addElement("Kr");
		ChemicalElement.addElement("Rb");
		ChemicalElement.addElement("Sr");
		ChemicalElement.addElement("Y");
		ChemicalElement.addElement("Zr");
		ChemicalElement.addElement("Nb");
		ChemicalElement.addElement("Mo");
		ChemicalElement.addElement("Tc");
		ChemicalElement.addElement("Ru");
		ChemicalElement.addElement("Rh");
		ChemicalElement.addElement("Pd");
		ChemicalElement.addElement("Ag");
		ChemicalElement.addElement("Cd");
		ChemicalElement.addElement("In");
		ChemicalElement.addElement("Sn");
		ChemicalElement.addElement("Sb");
		ChemicalElement.addElement("Te");
		ChemicalElement.addElement("I");
		ChemicalElement.addElement("Xe");
		ChemicalElement.addElement("Cs");
		ChemicalElement.addElement("Ba");
		ChemicalElement.addElement("La");
		ChemicalElement.addElement("Ce");
		ChemicalElement.addElement("Pr");
		ChemicalElement.addElement("Nd");
		ChemicalElement.addElement("Pm");
		ChemicalElement.addElement("Sm");
		ChemicalElement.addElement("Eu");
		ChemicalElement.addElement("Gd");
		ChemicalElement.addElement("Tb");
		ChemicalElement.addElement("Dy");
		ChemicalElement.addElement("Ho");
		ChemicalElement.addElement("Er");
		ChemicalElement.addElement("Tm");
		ChemicalElement.addElement("Yb");
		ChemicalElement.addElement("Lu");
		ChemicalElement.addElement("Hf");
		ChemicalElement.addElement("Ta");
		ChemicalElement.addElement("W");
		ChemicalElement.addElement("Re");
		ChemicalElement.addElement("Os");
		ChemicalElement.addElement("Ir");
		ChemicalElement.addElement("Pt");
		ChemicalElement.addElement("Au");
		ChemicalElement.addElement("Hg");
		ChemicalElement.addElement("Tl");
		ChemicalElement.addElement("Pb");
		ChemicalElement.addElement("Bi");
		ChemicalElement.addElement("Po");
		ChemicalElement.addElement("At");
		ChemicalElement.addElement("Rn");
		ChemicalElement.addElement("Fr");
		ChemicalElement.addElement("Ra");
		ChemicalElement.addElement("Ac");
		ChemicalElement.addElement("Th");
		ChemicalElement.addElement("Pa");
		ChemicalElement.addElement("U");
		ChemicalElement.addElement("Np");
		ChemicalElement.addElement("Pu");
		ChemicalElement.addElement("Am");
		ChemicalElement.addElement("Cm");
		ChemicalElement.addElement("Bk");
		ChemicalElement.addElement("Cf");
		ChemicalElement.addElement("Es");
		ChemicalElement.addElement("Fm");
		ChemicalElement.addElement("Md");
		ChemicalElement.addElement("No");
		ChemicalElement.addElement("Lr");
		ChemicalElement.addElement("Rf");
		ChemicalElement.addElement("Db");
		ChemicalElement.addElement("Sg");
		ChemicalElement.addElement("Bh");
		ChemicalElement.addElement("Hs");
		ChemicalElement.addElement("Mt");
		ChemicalElement.addElement("Ds");
		ChemicalElement.addElement("Rg");
		ChemicalElement.addElement("Cn");
		ChemicalElement.addElement("Nh");
		ChemicalElement.addElement("Fl");
		ChemicalElement.addElement("Mc");
		ChemicalElement.addElement("Lv");
		ChemicalElement.addElement("Ts");
		ChemicalElement.addElement("Og");
		// End
		ChemicalElement._allowCreate = false;
		return true;
	}

	static addElement(sample: String, sampleCN: String = ""): void {
		let element: ChemicalElement = new ChemicalElement(ChemicalElement.ELEMENTS.length + 1, sample);
		ChemicalElement.ELEMENTS.push(element);
	}

	static getElementFromSample(sample: String): (ChemicalElement | null) {
		for (let element of ChemicalElement.ELEMENTS) {
			if (element.sample == sample)
				return element;
		}
		return null;
	}

	static getElementFromOrdinal(ordinal: number): ChemicalElement | null {
		if (ordinal <= ChemicalElement.ELEMENTS.length) {
			return ChemicalElement.ELEMENTS[ordinal - 1];
		}
		return null;
	}

	//============Instance Variables============//
	protected _sample: String;
	protected _ordinal: number;

	//============Constructor Function============//
	public constructor(ordinal: number, sample: String) {
		if (!ChemicalElement._allowCreate) {
			throw new Error("Invalid constructor");
		}
		this._sample = sample;
		this._ordinal = ordinal;
	}

	//============Instance Getter And Setter============//
	protected get hasCNSample(): Boolean {
		return this._ordinal <= ChemicalElement.ZH_CN_ELEMENT_NAME.length;
	}

	public get sample(): String {
		return this._sample;
	}

	public get sample_CN(): String {
		if (this.hasCNSample)
			return ChemicalElement.ZH_CN_ELEMENT_NAME.charAt(this._ordinal - 1);
		return "";
	}

	public get ordinal(): number {
		return this._ordinal;
	}
}
