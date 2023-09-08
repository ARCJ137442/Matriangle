package batr.game.entity.ai.programs {

	import batr.common.*;
	import batr.general.*;
	import batr.game.map.*;

	/**
	 * ...
	 * @author ARCJ137442
	 */
	class PathNode extends iPoint {
		public parent: PathNode;

		/**
		 * From GlobalRot(U,D,L,R)
		 */
		public fromRot: uint = GlobalRot.NULL;

		public G: int = 0;
		public H: int = 0;

		public get F(): int {
			return this.G + this.H;
		}

		public get hasParent(): boolean {
			return this.parent != null;
		}

		public get hasFromRot(): boolean {
			return GlobalRot.isValidRot(this.fromRot);
		}

		public get rootParent(): PathNode {
			var p: PathNode = this.parent;
			while (p.parent != null && p.parent != this) {
				p = p.parent;
			}
			return p;
		}

		/**
		 * Didn't include the root
		 */
		public get pathToRoot(): PathNode[] {
			var result: PathNode[] = new Array<PathNode>(this);
			var p: PathNode = this.parent;
			while (p != this && p.parent && p.hasFromRot && p.parent.hasFromRot) {
				p = p.parent;
				result.push(p);
			}
			return result;
		}

		// Constructor
		public constructor(x: int, y: int, parent: PathNode = null) {
			super(x, y);
			this.parent = parent;
		}

		// Static Constructor
		public static fromPoint(p: iPoint): PathNode {
			return new PathNode(p.x, p.y, null);
		}

		// Methods
		public getFromRot(from: PathNode): uint {
			return GlobalRot.fromLinearDistance(this.x - from.x, this.y - from.y);
		}

		public autoSetFromRot(): void {
			if (this.hasParent) {
				this.fromRot = this.getFromRot(this.parent);
			}
		}

		/**
		 * @param	parent	A Point
		 * @return	This point
		 */
		public setParentAndFromRot(parent: PathNode): PathNode {
			this.parent = parent;
			this.autoSetFromRot();
			return this;
		}

		public setFromRot(rot: uint): PathNode {
			this.fromRot = rot;
			return this;
		}

		override toString(): string {
			return '[pos=' + super.toString() + ',F=' + this.F + ',G=' + this.G + ',H=' + this.H + ']';
		}
	}
}