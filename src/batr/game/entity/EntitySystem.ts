
// import batr.common.*;

import { uint } from "../../legacy/AS3Legacy";
import Game from "../main/Game.1";
import EntityCommon from "./EntityCommon";
import BonusBox from "./entities/item/BonusBox";
import Player from "./entities/player/Player";
import ProjectileCommon from "./entities/projectile/ProjectileCommon";

// import batr.game.entity.*;
// import batr.game.entity.entity.*;
// import batr.game.entity.entity.player.*;
// import batr.game.entity.entity.projectile.*;
// import batr.game.main.*;

// import flash.utils.Dictionary;

/**
 * Use for manage entities in game.
 */
export default class EntitySystem {
	//============Static Variables============//

	//============Instance Variables============//
	protected _host: IBatrGame;

	// UUID

	/**
	 * The UUID Process to system.
	 * getEntityByUUID(this._headUUID) usual equals null.
	 */
	protected _headUUID: uint = 1;
	protected _uuidDic: Dictionary = new Dictionary(true);

	protected _entities: EntityCommon[] = new EntityCommon[];
	protected _players: Player[] = new Player[];
	protected _projectiles: ProjectileCommon[] = new ProjectileCommon[];
	protected _bonusBoxes: BonusBox[] = new BonusBox[];

	//============Constructor & Destructor============//
	public constructor(host: IBatrGame) {
		this._host = host;
	}

	//============Destructor Function============//
	public destructor(): void {
		this.clearEntity();
		this._entities = null;

		this._players = null;

		this._projectiles = null;

		this._bonusBoxes = null;

		this._host = null;
	}

	//============Instance Getters And Setters============//
	public get host(): Game {
		return this._host;
	}

	public get entities(): EntityCommon[] {
		return this._entities;
	}

	public get players(): Player[] {
		return this._players;
	}

	public get projectiles(): ProjectileCommon[] {
		return this._projectiles;
	}

	public get bonusBoxes(): BonusBox[] {
		return this._bonusBoxes;
	}

	public get entityCount(): uint {
		if (this._entities == null)
			return 0;
		return this._entities.length;
	}

	public get playerCount(): uint {
		if (this._players == null)
			return 0;
		return this._players.length;
	}

	public get AICount(): uint {
		if (this._players == null)
			return 0;
		let rU: uint;
		for (let player of this._players) {
			if (Player.isAI(player))
				rU++;
		}
		return rU;
	}

	public get projectileCount(): uint {
		if (this._projectiles == null)
			return 0;
		return this._projectiles.length;
	}

	public get bonusBoxCount(): uint {
		if (this._bonusBoxes == null)
			return 0;
		return this._bonusBoxes.length;
	}

	//============Instance Functions============//
	// UUID About

	/**
	 * Find next empty UUID,let getEntityByUUID(this._headUUID)==null
	 * @return
	 */
	public nextUUID(): uint {
		while (getEntityByUUID(++this._headUUID) == null && isValidUUID(this._headUUID)) {
			return this._headUUID;
		}
		return 0;
	}

	public getEntityByUUID(uuid: uint): EntityCommon {
		return (this._uuidDic[uuid] as EntityCommon);
	}

	public getUUIDByEntity(entity: EntityCommon): uint {
		return uint(this._uuidDic[entity]);
	}

	/**
	 * Use for loop to register UUID for entity.
	 * @param	uuid	needed UUID
	 * @return	if uuid!=0
	 */
	public isValidUUID(uuid: uint): boolean {
		return uuid > 0;
	}

	public hasValidEntity(uuid: uint): boolean {
		return this.isValidUUID(uuid) && this.getEntityByUUID(uuid) != null;
	}

	public hasValidUUID(entity: EntityCommon): boolean {
		return entity != null && this.isValidUUID(this.getUUIDByEntity(entity));
	}

	public getAllEntity(): EntityCommon[] {
		let result: EntityCommon[] = new Array<EntityCommon>();
		for (let obj of this._uuidDic) {
			if (obj != null && obj is EntityCommon)
			result.push(obj as EntityCommon);
		}
		return result;
	}

	public getAllUUID(): uint[] {
		let result: uint[] = new array<uint>();
		for (let obj of this._uuidDic) {
			if (obj != null && obj is uint && isValidUUID(obj as uint))
			result.push(obj as uint);
		}
		return result;
	}

	public registerEntityForUUID(entity: EntityCommon): boolean {
		if (entity == null)
			return false;
		let uuid: uint = this.nextUUID();
		if (this.isValidUUID(uuid)) {
			this._uuidDic[entity] = uuid;
			this._uuidDic[uuid] = entity;
			return true;
		}
		return false;
	}

	public removeEntityForUUID(entity: EntityCommon): boolean {
		let uuid: uint = this.getUUIDByEntity(entity);
		if (this.isValidUUID(uuid)) {
			this._uuidDic[entity] = 0;
			this._uuidDic[uuid] = null;
			return true;
		}
		return false;
	}

	// Earlier System Functions
	public GC(): void {
		if (this._entities == null)
			return;
		// Entity
		while (this._entities.indexOf(null) >= 0) {
			this._entities.splice(this._entities.indexOf(null), 1);
		}
		// Player
		while (this._players.indexOf(null) >= 0) {
			this._players.splice(this._players.indexOf(null), 1);
		}
		// Projectiles
		while (this._projectiles.indexOf(null) >= 0) {
			this._projectiles.splice(this._projectiles.indexOf(null), 1);
		}
		// BonusBox
		while (this._bonusBoxes.indexOf(null) >= 0) {
			this._bonusBoxes.splice(this._bonusBoxes.indexOf(null), 1);
		}
	}

	// Register,Remove and Remove
	public isRegisteredEntity(entity: EntityCommon): boolean {
		// List
		/*return this._entities.some(
		function(e2:EntityCommon,i:uint,v:EntityCommon[]) {
			return e2==entity
		})*/
		// UUIDMap
		return this.hasValidUUID(entity);
	}

	public registerEntity(entity: EntityCommon): boolean {
		if (entity == null || isRegisteredEntity(entity))
			return false;

		// List
		this._entities.push(entity);

		// UUIDMap
		if (!this.hasValidUUID(entity))
			this.registerEntityForUUID(entity);
		return true;
	}

	public removeEntity(entity: EntityCommon): boolean {
		if (entity == null || !isRegisteredEntity(entity))
			return false;

		// List
		this._entities.splice(this._entities.indexOf(entity), 1);

		// UUIDMap
		if (this.hasValidUUID(entity))
			this.removeEntityForUUID(entity);
		return true;
	}

	public removeEntity(entity: EntityCommon): void {
		if (entity == null)
			return;
		entity.destructor();
		this.removeEntity(entity);
		if (entity is Player)
		this.removePlayer(entity as Player);
		if (entity is ProjectileCommon)
		this.removeProjectile(entity as ProjectileCommon);
		if (entity is BonusBox)
		this.removeBonusBox(entity as BonusBox);
		Utils.removeChildIfContains(this._host.playerContainer, entity);
		Utils.removeChildIfContains(this._host.projectileContainer, entity);
		Utils.removeChildIfContains(this._host.bonusBoxContainer, entity);
	}

	/**
	 * Remove All Entity!
	 */
	public clearEntity(): void {
		while (this._entities.length > 0) {
			this.removeEntity(this._entities[0]);
		}
		// Reset UUID Head
		this._headUUID = 0;
		// this._uuidDic=new Dictionary(true);
	}

	public isRegisteredPlayer(player: Player): boolean {
		// List
		return this._players.some(
			function (p2: Player, i: uint, v: Player[]) {
				return p2 == player;
			});
	}

	public registerPlayer(player: Player): boolean {
		if (player == null || isRegisteredEntity(player))
			return false;

		registerEntity(player);

		this._players.push(player);

		return true;
	}

	public removePlayer(player: Player): boolean {
		if (player == null || !isRegisteredPlayer(player))
			return false;

		this._players.splice(this._players.indexOf(player), 1);

		this.removeEntity(player);

		return true;
	}

	public removePlayer(player: Player): void {
		this.removePlayer(player);

		this.removeEntity(player);
	}

	public clearPlayer(): void {
		while (this._players.length > 0) {
			this.removePlayer(this._players[0]);
		}
	}

	public isRegisteredProjectile(projectile: ProjectileCommon): boolean {
		// List
		return this._projectiles.some(
			function (p2: ProjectileCommon, i: uint, v: ProjectileCommon[]) {
				return p2 == projectile;
			});
	}

	public registerProjectile(projectile: ProjectileCommon): boolean {
		if (projectile == null || isRegisteredEntity(projectile))
			return false;

		this.registerEntity(projectile);

		this._projectiles.push(projectile);

		return true;
	}

	public removeProjectile(projectile: ProjectileCommon): boolean {
		if (projectile == null || !isRegisteredProjectile(projectile))
			return false;

		this._projectiles.splice(this._projectiles.indexOf(projectile), 1);

		removeEntity(projectile);

		return true;
	}

	public removeProjectile(projectile: ProjectileCommon): void {
		this.removeProjectile(projectile);

		this.removeEntity(projectile);
	}

	public clearProjectile(): void {
		while (this._projectiles.length > 0) {
			this.removeProjectile(this._projectiles[0]);
		}
	}

	public isRegisteredBonusBox(bonusBox: BonusBox): boolean {
		// List
		return this._bonusBoxes.some(
			function (p2: BonusBox, i: uint, v: BonusBox[]) {
				return p2 == bonusBox;
			});
	}

	public registerBonusBox(bonusBox: BonusBox): boolean {
		if (bonusBox == null || isRegisteredBonusBox(bonusBox))
			return false;

		this.registerEntity(bonusBox);

		this._bonusBoxes.push(bonusBox);

		return true;
	}

	public removeBonusBox(bonusBox: BonusBox): boolean {
		if (bonusBox == null || !isRegisteredBonusBox(bonusBox))
			return false;

		this._bonusBoxes.splice(this._bonusBoxes.indexOf(bonusBox), 1);

		this.removeEntity(bonusBox);

		return true;
	}

	public removeBonusBox(bonusBox: BonusBox): void {
		this.removeBonusBox(bonusBox);

		this.removeEntity(bonusBox);
	}

	public clearBonusBox(): void {
		while (this._bonusBoxes.length > 0) {
			this.removeBonusBox(this._bonusBoxes[0]);
		}
	}
}