import { NativeBlockAttributes } from "../../registry/BlockRegistry";
import BlockCommon from "../BlockCommon";

export default class BlockVoid extends BlockCommon {
	//============Constructor & Destructor============//
	public constructor() {
		super(NativeBlockAttributes.VOID);
	}

	override destructor(): void {
		super.destructor();
	}

	override clone(): BlockCommon {
		return new BlockVoid();
	}
}