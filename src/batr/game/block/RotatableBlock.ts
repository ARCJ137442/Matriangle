package batr.game.block {

	import batr.game.block.*;

	// Abstract
	export default class RotatableBlock extends BlockCommon {
		//============Static Functions============//

		//============Instance Variables============//
		protected _rot: uint;

		//============Constructor Function============//
		public RotatableBlock(rot: uint): void {
			this._rot = rot;
			super();
		}

		//============Destructor Function============//
		public override function destructor(): void {
			super.destructor();
		}

		//============Instance Getter And Setter============//
		public get rot(): uint {
			return this._rot;
		}

		//============Instance Functions============//
		public override function clone(): BlockCommon {
			return new RotatableBlock(this._rot);
		}
	}
}