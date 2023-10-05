import { iPointRef } from "../../common/geometricTools";
import { uint } from "../../legacy/AS3Legacy";
import Entity from "../api/entity/Entity";
import { IEntityActive, IEntityActiveLite } from "../api/entity/EntityInterfaces";
import EntitySystem from "../api/entity/EntitySystem";
import IMap from "../api/map/IMap";
import { getRandomMap } from "../mods/native/registry/NativeMatrixMechanics";
import MatrixRule_V1 from "../mods/native/rule/MatrixRule_V1";
import IMatrixRule from "../rule/IMatrixRule";
import IBatrMatrix from "./IBatrMatrix";
import IBatrRegistry from "../mods/native/registry/IBatrRegistry";
import { isDefined } from "../../common/utils";

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
		for (const entity of this._entitySystem.entries) {
			// 是否合法
			// !【2023-10-05 15:30:45】因为「实体系统」可能删掉了中间的实体，所以确实有可能遍历到`undefined`（除非用GC清除冗余……但那样还不如直接跳过）
			if (entity === undefined) continue;
			/*
			!【2023-10-05 15:21:50】中途有可能会有实体（将）被删除，这没错
			! 但我们现在不暴露「实体系统」，外界统一调用的`host.removeEntity`
			! 💡所以我们可以在`removeEntity`处先缓存，再在每一个游戏刻后进行GC
			! 这样就避免了「中途移除实体，导致遍历不准确，甚至遇到undefined直接报错」的问题
			*/
			if (entity.isActive) {
				// 按照接口分派
				if ((entity as IEntityActive)?.i_active)
					(entity as IEntityActive).onTick(this);
				else if ((entity as IEntityActiveLite)?.i_activeLite)
					(entity as IEntityActiveLite).onTick(this.removeEntity.bind(this)); // !【2023-10-05 15:25:50】这里使用bind绑定this参数，避免「半途丢this」的情况
			}
		}
		// 实体回收（Merovingian？）
		if (this._temp_tick_entityToDeleted.length > 0) {
			// 正式删除实体
			this._temp_tick_entityToDeleted.forEach(this._entitySystem.remove.bind(this._entitySystem)); // !【2023-10-05 15:25:50】这里使用bind绑定this参数，避免「半途丢this」的情况
			this._temp_tick_entityToDeleted.length = 0;
			// // 通知「实体系统」清除冗余空间
			// this._entitySystem.GC();
		}
	}
	protected _temp_tick_entityToDeleted: Entity[] = [];

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
	/**  setter不在接口实现范围内 */
	public set map(value: IMap) { this._currentMap = value }

	public get mapTransformPeriod(): uint { return this._rule.safeGetRule<uint>(MatrixRule_V1.key_mapTransformTime) }

	//========🌟实体部分：实体管理、实体事件等========//

	/** 实体系统（内部变量） */
	protected _entitySystem: EntitySystem = new EntitySystem();
	public get entities(): Entity[] {
		return this._entitySystem.entries.filter(isDefined) as Entity[];
	}

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
		// 现在直接缓存，并返回true
		this._temp_tick_entityToDeleted.push(entity);
		return true;
		// return this._entitySystem.remove(entity);
	}

}

