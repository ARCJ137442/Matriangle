package batr.game.map.main {

	import batr.common.exMath;
	import batr.common.iPoint;
	import batr.common.UintPointCompress;

	import batr.game.map.IMapDisplayer;
	import batr.game.block.BlockType;
	import batr.game.block.BlockAttributes;
	import batr.game.block.BlockCommon;
	import batr.game.map.IMap;

	/**
	 * This class only achieved spawnpoints
	 */
	export default class NativeMapCommon implements IMap {
		//============Static Functions============//
		protected static function getTargetByLayer(l: int, top: IMapDisplayer, bottom: IMapDisplayer, middle: IMapDisplayer): IMapDisplayer {
			return l > 0 ? top : (l < 0 ? bottom : middle);
		}

		//============Instance Variables============//
		protected _spawnPoints: uint[] = new uint[]();
		protected _arena: Boolean = false;
		protected _name: String;

		//============Constructor============//
		public function NativeMapCommon(name: String, arena: Boolean = false): void {
			super();
			this._arena = arena;
			this._name = name;
		}

		//============Destructor============//
		public function destructor(): void {
			this._spawnPoints = null;
			this._name = null;
		}

		//============Interface Getter And Setter============//
		public function get mapWidth(): uint {
			return 0;
		}

		public function get mapHeight(): uint {
			return 0;
		}

		public function get randomX(): int {
			return 0;
		}

		public function get randomY(): int {
			return 0;
		}

		public function get allDefinedPositions(): iPoint[] {
			return null;
		}

		public function get allMapPositions(): iPoint[] {
			return null;
		}

		public function get spawnPoints(): uint[] {
			return this._spawnPoints;
		}

		public function get name(): String {
			return this._name;
		}

		public function get numSpawnPoints(): uint {
			return this._spawnPoints.length;
		}

		public function get hasSpawnPoint(): Boolean {
			return this.numSpawnPoints > 0;
		}

		public function get randomSpawnPoint(): iPoint {
			if (this.hasSpawnPoint) {
				return UintPointCompress.releaseFromUint(this._spawnPoints[exMath.random(this.numSpawnPoints)]);
			}
			return null;
		}

		/**
		 * This property determines this map's
		 * switch/mechine/trap/spawner can be destroy or carry
		 * by Weapon BlockThrower.
		 */
		public function get isArenaMap(): Boolean {
			return this._arena;
		}

		//============Tool Functions============//
		public function addSpawnPointWithMark(x: int, y: int): void {
			this.addSpawnPoint(UintPointCompress.compressFromPoint(x, y));
			this.setBlock(x, y, BlockCommon.fromType(BlockType.SPAWN_POINT_MARK));
		}

		protected function removeDisplayerBlockAt(x: int, y: int, bottom: IMapDisplayer, middle: IMapDisplayer, top: IMapDisplayer): void {
			if (bottom != null)
				bottom.removeBlock(x, y);
			if (middle != null)
				middle.removeBlock(x, y);
			if (top != null)
				top.removeBlock(x, y);
		}

		//============Interface Functions============//
		public function clone(createBlock: Boolean = true): IMap {
			return null;
		}

		/**
		 * only copy _isArena
		 */
		public function copyFrom(target: IMap, clearSelf: Boolean = false, createBlock: Boolean = true): void {
			// name
			this._name = target.name;
			// isArena
			this._arena = target.isArenaMap;
		}

		/**
		 * only copy spawnpoints
		 */
		public function copyContentFrom(target: IMap, clearSelf: Boolean = false, createBlock: Boolean = true): void {
			// spawnpoints
			this._spawnPoints = target.spawnPoints.concat();
		}

		public function generateNew(): IMap {
			return this.clone(true);
		}

		public function hasBlock(x: int, y: int): Boolean {
			return false;
		}

		public function getBlock(x: int, y: int): BlockCommon {
			return null;
		}

		public function getBlockAttributes(x: int, y: int): BlockAttributes {
			return null;
		}

		public function getBlockType(x: int, y: int): BlockType {
			return null;
		}

		public function setBlock(x: int, y: int, block: BlockCommon): void {
			return;
		}

		public function isVoid(x: int, y: int): Boolean {
			return false;
		}

		public function setVoid(x: int, y: int): void {
			return;
		}

		public function removeAllBlock(deleteBlock: Boolean = true): void {
			return;
		}

		public function setDisplayTo(target: IMapDisplayer): void {
			return;
		}

		public function forceDisplayToLayers(targetBottom: IMapDisplayer, targetMiddle: IMapDisplayer, targetTop: IMapDisplayer): void {
			return;
		}

		public function updateDisplayToLayers(x: int, y: int, block: BlockCommon, targetBottom: IMapDisplayer, targetMiddle: IMapDisplayer, targetTop: IMapDisplayer): void {
			this.removeDisplayerBlockAt(x, y, targetBottom, targetMiddle, targetTop);
			if (block != null)
				getTargetByLayer(block.attributes.drawLayer, targetTop, targetBottom, targetMiddle).setBlock(x, y, block);
		}

		//========SpawnPoint About========//

		/**
		 * @param	p	the point uses UintPointCompress
		 */
		public function addSpawnPoint(p: uint): void {
			this._spawnPoints.push(p);
		}

		/**
		 * @param	p	the point uses UintPointCompress
		 */
		public function removeSpawnPoint(p: uint): void {
			for (var i: int = this._spawnPoints.length - 1; i > 0; --i) {
				if (this._spawnPoints[i] == p)
					this._spawnPoints.splice(i, 1);
			}
		}

		public function clearSpawnPoints(): void {
			this._spawnPoints.splice(0, this.numSpawnPoints);
		}

		//========AI About========//

		/**
		 * Get with Matrix[x][y].
		 * @return	The Matrix.
		 */
		public function getMatrixObject(): Vector.<Object[]> {
			var result: Vector.<Object[]> = new Vector.<Object[]>(this.mapHeight);
			var vec: Object[];
			for (var i: uint = 0; i < this.mapHeight; i++) {
				vec = new Object[](this.mapWidth);
				result[i] = vec;
			}
			return result;
		}

		/**
		 * Get with Matrix[x][y].
		 * @return	The Matrix.
		 */
		public function getMatrixInt(): Vector.<int[]> {
			var result: Vector.<int[]> = new Vector.<int[]>(this.mapHeight);
			var vec: int[];
			for (var i: uint = 0; i < this.mapHeight; i++) {
				vec = new int[](this.mapWidth);
				result[i] = vec;
			}
			return result;
		}

		/**
		 * Get with Matrix[x][y].
		 * @return	The Matrix.
		 */
		public function getMatrixUint(): Vector.<uint[]> {
			var result: Vector.<uint[]> = new Vector.<uint[]>(this.mapHeight);
			var vec: uint[];
			for (var i: uint = 0; i < this.mapHeight; i++) {
				vec = new uint[](this.mapWidth);
				result[i] = vec;
			}
			return result;
		}

		/**
		 * Get with Matrix[x][y].
		 * @return	The Matrix.
		 */
		public function getMatrixNumber(): Vector.<Number[]> {
			var result: Vector.<Number[]> = new Vector.<Number[]>(this.mapHeight);
			var vec: Number[];
			for (var i: uint = 0; i < this.mapHeight; i++) {
				vec = new Number[](this.mapWidth);
				result[i] = vec;
			}
			return result;
		}

		/**
		 * Get with Matrix[x][y].
		 * @return	The Matrix.
		 */
		public function getMatrixBoolean(): Vector.<Boolean[]> {
			var result: Vector.<Boolean[]> = new Vector.<Boolean[]>(this.mapHeight);
			var vec: Boolean[];
			for (var i: uint = 0; i < this.mapHeight; i++) {
				vec = new Boolean[](this.mapWidth);
				result[i] = vec;
			}
			return result;
		}
	}
}
