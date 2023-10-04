import { iPoint, iPointRef, intPoint } from "../../common/geometricTools";
import { uint } from "../../legacy/AS3Legacy";
import Entity from "../api/entity/Entity";
import { IEntityActive, IEntityActiveLite } from "../api/entity/EntityInterfaces";
import EntitySystem from "../api/entity/EntitySystem";
import IMap from "../api/map/IMap";
import IPlayer from "../mods/native/entities/player/IPlayer";
import { getPlayers, getRandomMap } from "../mods/native/registry/NativeMatrixMechanics";
import MatrixRule_V1 from "../mods/native/rule/MatrixRule_V1";
import GameResult from "../mods/native/stat/GameResult";
import IMatrixRule from "../rule/IGameRule";
import IBatrMatrix from "./IBatrMatrix";
import IBatrRegistry from "../mods/native/registry/IBatrRegistry";

/**
 * 「游戏母体」的第一代实现
 * * 具体功能&作用，参考其实现的接口
 */
export default class Matrix_V1 implements IBatrMatrix {

	//========♻️生命周期：世界构造、世界重置========//

	/**
	 * 构造函数
	 * @param rule 加载入的规则
	 * @param registry 链接的注册表
	 */
	public constructor(
		rule: IMatrixRule,
		registry: IBatrRegistry,
	) {
		// 直接上载变量
		this._rule = rule;
		this._registry = registry;
		// 第一个地图
		this._currentMap = getRandomMap(this._rule);
		// this.isActive = active; // ? 【2023-10-04 23:22:21】为何要「是否激活」呢
	}

	reset(): boolean {
		throw new Error("Method not implemented.");
	}

	restart(rule: IMatrixRule, becomeActive?: boolean | undefined): void {
		throw new Error("Method not implemented.");
	}

	forceStart(rule: IMatrixRule, becomeActive?: boolean | undefined): boolean {
		throw new Error("Method not implemented.");
	}

	//========🕹️控制部分：主循环========//
	tick(): void {
		// 方块随机刻
		this.randomTickAt(
			this.map.storage.randomPoint
		)
		// 实体刻
		for (const entity of this.entities) {
			if (entity.isActive) {
				// 按照接口分派
				if ('i_active' in entity)
					(entity as IEntityActive).onTick(this);
				else if ('i_activeLite' in entity)
					(entity as IEntityActiveLite).onTick(this.removeEntity);
			}
		}
	}

	/**
	 * 方块随机刻
	 * @param p 随机刻轮到的位置
	 */
	protected randomTickAt(p: iPointRef): void {
		// BonusBox(Supply) // TODO: 奖励箱生成逻辑
		/* if (this.map.testBonusBoxCanPlaceAt(p, getPlayers(this))) {
			if (this.map.storage.getBlockAttributes(p).supplyingBonus ||
				((this.rule.bonusBoxMaxCount < 0 || this._entitySystem.bonusBoxCount < this.rule.bonusBoxMaxCount) &&
					Utils.randomBoolean2(this.rule.bonusBoxSpawnChance))
			) {
				addBonusBoxInRandomTypeByRule(this, p);
			}
		} */
		// Other
		switch (this.map.storage.getBlockType(p)) {
			// TODO: 日后在这里建立分派机制

		}
	}

	//========🎛️规则部分：规则加载、规则读写========//

	// 规则 //
	protected _rule: IMatrixRule;
	public get rule(): IMatrixRule { return this._rule }

	initByRule(): boolean {
		// TODO: 【2023-10-04 23:33:51】仍在开发中
		// Return
		return true;
	}

	// 注册表 //
	protected _registry: IBatrRegistry;
	public get registry(): IBatrRegistry { return this._registry }

	//========🗺️地图部分：地图加载、地图变换等========//

	protected _currentMap: IMap;
	public get map(): IMap { return this._currentMap }

	public get mapTransformPeriod(): uint { return this._rule.safeGetRule<uint>(MatrixRule_V1.key_mapTransformTime) }

	//========🌟实体部分：实体管理、实体事件等========//

	/** 实体系统（内部变量） */
	protected _entitySystem: EntitySystem = new EntitySystem();
	public get entities(): Entity[] { return this._entitySystem.entries }

	// 实现：委托到「实体系统」
	public addEntity(entity: Entity): boolean {
		this._entitySystem.add(entity)
		return true;
	}

	// 实现：委托到「实体系统」
	public addEntities(...entities: Entity[]): void {
		for (const entity of entities)
			this._entitySystem.add(entity);
	}

	// 实现：委托到「实体系统」
	public removeEntity(entity: Entity): boolean {
		return this._entitySystem.remove(entity);
	}
	//============Constructor & Destructor============//

}

