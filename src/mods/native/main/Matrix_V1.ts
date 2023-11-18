import { uint } from 'matriangle-legacy/AS3Legacy'
import Entity from 'matriangle-api/server/entity/Entity'
import EntitySystem from './EntitySystem'
import IMap from 'matriangle-api/server/map/IMap'
import IMatrixRule from 'matriangle-api/server/rule/IMatrixRule'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import IWorldRegistry from 'matriangle-api/server/registry/IWorldRegistry'
import {
	OptionalRecursive2,
	Val,
	isDefined,
	voidF,
} from 'matriangle-common/utils'
import { projectEntity } from '../mechanics/NativeMatrixMechanics'
import { IDisplayDataMatrix } from 'matriangle-api/display/RemoteDisplayAPI'

/**
 * 母体的第一代实现
 * * 具体功能&作用，参考其实现的接口
 */
export default class Matrix_V1 implements IMatrix {
	//========♻️生命周期：世界构造、世界重置========//

	/**
	 * 构造函数
	 * @param rule 加载入的规则
	 * @param registry 链接的注册表
	 */
	constructor(
		rule: IMatrixRule,
		registry: IWorldRegistry,
		initialMap: Val<IMap>
	) {
		// 直接上载变量
		this._rule = rule
		this._registry = registry
		// 第一个地图 // !【2023-10-08 22:30:51】现在对地图进行深拷贝，而非复用原先的地图
		this._currentMap = initialMap
		// this.isActive = active; // ? 【2023-10-04 23:22:21】为何要「是否激活」呢
	}

	//============Display Implementation========//

	// 可显示：呈递显示数据 //
	readonly i_displayable = true as const

	getDisplayDataInit(): IDisplayDataMatrix {
		return {
			// ! 此处获取的是「存储结构」的「初始数据」
			map: this.map.storage.getDisplayDataInit(),
			// * 使用「实体系统」代理
			entities: this._entitySystem.getDisplayDataInit(),
		}
	}

	/**
	 * @implements // TODO: 暂时还是直接用「初始化数据」
	 */
	getDisplayDataRefresh(): OptionalRecursive2<IDisplayDataMatrix> {
		return this.getDisplayDataInit()
	}

	//========🎛️规则部分：规则加载、规则读写========//
	// 规则 //
	protected _rule: IMatrixRule
	get rule(): IMatrixRule {
		return this._rule
	}

	initByRule(): boolean {
		// TODO: 【2023-10-04 23:33:51】仍在开发中
		// Return
		return true
	}

	// 注册表 //
	protected _registry: IWorldRegistry
	get registry(): IWorldRegistry {
		return this._registry
	}

	//========🗺️地图部分：地图加载、地图变换等========//
	protected _currentMap: IMap
	get map(): IMap {
		return this._currentMap
	}
	set map(value: IMap) {
		this._currentMap = value
	}

	//========🌟实体部分：实体管理、实体事件等========//
	/** 实体系统（内部变量） */
	protected _entitySystem: EntitySystem = new EntitySystem(true)
	get entities(): Entity[] {
		return this._entitySystem.entries.filter(isDefined) as Entity[]
	}

	/** @implements 实现：委托到「实体系统」 */
	addEntity(entity: Entity): boolean {
		// 预先投影
		projectEntity(this.map, entity)
		// 委托添加
		this._entitySystem.add(entity)
		return true
	}

	/** @implements 实现：委托到「实体系统」 */
	addEntities(...entities: Entity[]): void {
		for (const entity of entities) this._entitySystem.add(entity)
	}

	/** @implements 实现：委托到「实体系统」 */
	removeEntity(entity: Entity): boolean {
		// 现在直接缓存，并返回true
		this._temp_tick_entityToDeleted.push(entity)
		return true
		// return this._entitySystem.remove(entity);
	}

	//========🕹️控制部分：主循环/重置/重启========//
	tick(): void {
		// 实体刻 // !【2023-10-12 17:36:58】现在只需遍历其中的「（轻量级）活跃实体」
		// !【2023-10-07 21:10:37】目前删除了「方块随机刻」，交给其中一个「程序」管理
		// !【2023-11-18 09:29:58】不能将其内置到「实体系统」中：这样会**循环导入**的
		for (const entity of this._entitySystem.entriesActive)
			if (entity.isActive) entity.onTick(this)
		for (const entity of this._entitySystem.entriesActiveLite)
			if (entity.isActive) entity.onTick(this._temp_removeF)
		/*
		!【2023-10-05 15:21:50】中途有可能会有实体（将）被删除，这没错
		! 但现在不暴露「实体系统」，外界统一调用的`host.removeEntity`
		! 💡所以可以在`removeEntity`处先缓存，再在每一个世界刻后进行GC
		! 这样就避免了「中途移除实体，导致遍历不准确，甚至遇到undefined直接报错」的问题
		! 尽可能避免在「世界刻」之外调用此中的`removeEntity`，若日后遇到多线程/多进程环境，「删除后遍历出undefined」的问题还会出现
		*/
		// 实体回收（Merovingian？）
		if (this._temp_tick_entityToDeleted.length > 0) {
			// 正式删除实体
			this._temp_tick_entityToDeleted.forEach(this._temp_removeSysF)
			this._temp_tick_entityToDeleted.length = 0
			// 在一定情况下通知「实体系统」清除冗余空间（触发GC）
			if (
				this._entitySystem.numEntries >
				this._temp_tick_lastGCEntityCountMax
			) {
				this._entitySystem.GC()
				this._temp_tick_lastGCEntityCount =
					this._entitySystem.numEntries
				this._temp_tick_lastGCEntityCountMax =
					this._temp_tick_lastGCEntityCount *
					this._temp_tick_GCCoefficient
			}
		}
		// 执行「最终代码」：先插入先执行
		for (const exe of this._tick_finalExecutions) exe()
		// 记得最后回收
		this._tick_finalExecutions.length = 0
	}
	/** 缓存的「删除实体」函数 */
	protected readonly _temp_removeF: (e: Entity) => void =
		this.removeEntity.bind(this)
	/** 缓存的「直接在系统内删除实体」函数 */
	protected readonly _temp_removeSysF: (e: Entity) => void =
		this._entitySystem.remove.bind(this._entitySystem) // !【2023-10-05 15:25:50】这里使用bind绑定this参数，避免「半途丢this」的情况
	/** 缓存的「待删除实体列表」 */
	protected _temp_tick_entityToDeleted: Entity[] = []
	/** 上一次GC时的实体数量 */
	protected _temp_tick_lastGCEntityCount: uint = 0
	/** 触发GC的上限 */
	protected _temp_tick_lastGCEntityCountMax: uint = 0
	/**
	 * 每次触发GC时，「GC上限」增长的倍率
	 * *【2023-10-08 22:19:27】这里学习的是Lua的对象回收机制：在每次「实体数量增长到『上一次GC是实体数量』的某个倍数」时触发GC
	 */
	protected _temp_tick_GCCoefficient: uint = 2
	/** 待执行的「终执函数」，在所有实体刻、实体回收后执行 */
	protected _tick_finalExecutions: (() => void)[] = []
	/** @implements 实现：直接加入列表 */
	insertFinalExecution(exe: voidF): void {
		this._tick_finalExecutions.push(exe)
	}

	reset(): boolean {
		throw new Error('Method not implemented.')
	}

	restart(rule: IMatrixRule): void {
		// ?【2023-11-18 16:42:15】原有实现中`becomeActive`似乎已无意义
	}

	forceStart(rule: IMatrixRule): boolean {
		throw new Error('Method not implemented.')
	}
}
