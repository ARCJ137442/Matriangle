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

		public function get F(): int {
			return this.G + this.H;
		}

		public function get hasParent(): Boolean {
			return this.parent != null;
		}

		public function get hasFromRot(): Boolean {
			return GlobalRot.isValidRot(this.fromRot);
		}

		public function get rootParent(): PathNode {
			var p: PathNode = this.parent;
			while (p.parent != null && p.parent != this) {
				p = p.parent;
			}
			return p;
		}

		/**
		 * Didn't include the root
		 */
		public function get pathToRoot(): PathNode[] {
			var result: PathNode[] = new < PathNode > [this];
			var p: PathNode = this.parent;
			while (p != this && p.parent && p.hasFromRot && p.parent.hasFromRot) {
				p = p.parent;
				result.push(p);
			}
			return result;
		}

		// Constructor
		public function PathNode(x: int, y: int, parent: PathNode = null): void {
			super(x, y);
			this.parent = parent;
		}

		// Static Constructor
		public static function fromPoint(p: iPoint): PathNode {
			return new PathNode(p.x, p.y, null);
		}

		// Methods
		public function getFromRot(from: PathNode): uint {
			return GlobalRot.fromLinearDistance(this.x - from.x, this.y - from.y);
		}

		public function autoSetFromRot(): void {
			if (this.hasParent) {
				this.fromRot = this.getFromRot(this.parent);
			}
		}

		/**
		 * @param	parent	A Point
		 * @return	This point
		 */
		public function setParentAndFromRot(parent: PathNode): PathNode {
			this.parent = parent;
			this.autoSetFromRot();
			return this;
		}

		public function setFromRot(rot: uint): PathNode {
			this.fromRot = rot;
			return this;
		}

		public override function toString(): String {
			return '[pos=' + super.toString() + ',F=' + this.F + ',G=' + this.G + ',H=' + this.H + ']';
		}
	}
}