package batr.game.effect {

	import batr.common.*;

	import batr.game.effect.*;
	import batr.game.main.*;

	import flash.utils.Dictionary;

	/**
	 * Use for manage effects in game.
	 */
	export default class EffectSystem {
		//============Static Variables============//

		//============Static Functions============//

		//============Instance Variables============//
		protected _host: Game;

		// UUID

		/**
		 * The UUID Process to system.
		 * getEffectByUUID(this._headUUID) usual equals null.
		 */
		protected _headUUID: uint = 1;
		protected _uuidDic: Dictionary = new Dictionary(true);

		protected _effects: EffectCommon[] = new EffectCommon[];

		//============Constructor & Destructor============//
		public constructor(host: Game) {
			this._host = host;
		}

		//============Destructor Function============//
		public destructor(): void {
			this.removeAllEffect();
			this._effects = null;

			this._host = null;
		}

		//============Instance Getters And Setters============//
		public get host(): Game {
			return this._host;
		}

		public get effects(): EffectCommon[] {
			return this._effects;
		}

		public get effectCount(): uint {
			if (this._effects == null)
				return 0;
			return this._effects.length;
		}

		//============Instance Functions============//
		public nextUUID(): uint {
			while (getEffectByUUID(++this._headUUID) == null && isValidUUID(this._headUUID)) {
				return this._headUUID;
			}
			return 0;
		}

		public getEffectByUUID(uuid: uint): EffectCommon {
			return (this._uuidDic[uuid] as EffectCommon);
		}

		public getUUIDByEffect(effect: EffectCommon): uint {
			return uint(this._uuidDic[effect]);
		}

		/**
		 * Use for loop to register UUID for effect.
		 * @param	uuid	needed UUID
		 * @return	if uuid!=0
		 */
		public isValidUUID(uuid: uint): boolean {
			return uuid > 0;
		}

		public hasValidEffect(uuid: uint): boolean {
			return this.isValidUUID(uuid) && this.getEffectByUUID(uuid) != null;
		}

		public hasValidUUID(effect: EffectCommon): boolean {
			return effect != null && this.isValidUUID(this.getUUIDByEffect(effect));
		}

		public getAllEffect(): EffectCommon[] {
			var result: EffectCommon[] = new EffectCommon[]();
			for (var obj of this._uuidDic) {
				if (obj != null && obj is EffectCommon)
				result.push(obj as EffectCommon);
			}
			return result;
		}

		public getAllUUID(): uint[] {
			var result: uint[] = new uint[]();
			for (var obj of this._uuidDic) {
				if (obj != null && obj is uint && isValidUUID(obj as uint))
				result.push(obj as uint);
			}
			return result;
		}

		public registerEffectforUUID(effect: EffectCommon): boolean {
			if (effect == null)
				return false;
			var uuid: uint = this.nextUUID();
			if (this.isValidUUID(uuid)) {
				this._uuidDic[effect] = uuid;
				this._uuidDic[uuid] = effect;
				return true;
			}
			return false;
		}

		public removeEffectforUUID(effect: EffectCommon): boolean {
			var uuid: uint = this.getUUIDByEffect(effect);
			if (this.isValidUUID(uuid)) {
				this._uuidDic[effect] = 0;
				this._uuidDic[uuid] = null;
				return true;
			}
			return false;
		}

		public GC(): void {
			if (this._effects == null)
				return;
			// Effect
			while (this._effects.indexOf(null) >= 0) {
				this._effects.splice(this._effects.indexOf(null), 1);
			}
		}

		// Register,Remove and Remove
		public isRegisteredEffect(effect: EffectCommon): boolean {
			// List
			/*return this._effects.some(
			function(e2:EffectCommon,i:uint,v:EffectCommon[]) {
				return e2==effect
			})*/
			// UUIDMap
			return this.hasValidUUID(effect);
		}

		public registerEffect(effect: EffectCommon): boolean {
			if (effect == null || isRegisteredEffect(effect))
				return false;
			// List
			this._effects.push(effect);

			// UUIDMap
			if (!this.hasValidUUID(effect))
				this.registerEffectforUUID(effect);
			return true;
		}

		public removeEffect(effect: EffectCommon): boolean {
			if (effect == null || !isRegisteredEffect(effect))
				return false;
			// List
			this._effects.splice(this._effects.indexOf(effect), 1);
			// UUIDMap
			if (this.hasValidUUID(effect))
				this.removeEffectforUUID(effect);
			return true;
		}

		public addEffect(effect: EffectCommon): void {
			this.registerEffect(effect);

			this._host.addEffectChild(effect);
		}

		public removeEffect(effect: EffectCommon): void {
			if (effect == null)
				return;

			effect.destructor();

			removeEffect(effect);

			Utils.removeChildIfContains(this._host.effectContainerBottom, effect);

			Utils.removeChildIfContains(this._host.effectContainerTop, effect);
		}

		public removeAllEffect(): void {
			while (this._effects.length > 0) {
				this.removeEffect(this._effects[0]);
			}
		}
	}
}