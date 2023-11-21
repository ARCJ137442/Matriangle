import { typeID } from 'matriangle-api'
import {
	IStateDisplayer,
	IDisplayDataEntities,
	IDisplayDataEntity,
	IDisplayDataEntityState,
} from 'matriangle-api/display/RemoteDisplayAPI'
import { OptionalRecursive2, mergeObject } from 'matriangle-common'
import { uint } from 'matriangle-legacy'
import { Container } from 'zimjs'
import { ZimShapeDisplayer } from './zim_client_common'
import { ZimDisplayerMatrix } from './zim_client_matrix'
import { EntityDrawDict } from '../implements/zim_client_entity'

/**
 * 通用的实体呈现者
 */
export class ZimDisplayerEntity<
		ESType extends IDisplayDataEntityState = IDisplayDataEntityState,
	>
	extends ZimShapeDisplayer<IDisplayDataEntity<ESType>>
	implements IStateDisplayer<IDisplayDataEntity<ESType>>
{
	/** 当前持有的「实体id/实体类型」 */
	protected _currentEntityID: typeID = undefined as unknown as typeID // ! 一定会在构造函数的`shapeInit`中初始化

	/** 当前持有的「实体显示数据」 */
	protected _currentEntityState: ESType = undefined as unknown as ESType // ! 一定会在构造函数的`shapeInit`中初始化

	/**
	 * 构造函数
	 *
	 * @param initialData 初始数据
	 */
	public constructor(
		/** 这个属性是为了后续更新位置时可投影而设立的（需要依赖外部数据） */
		public readonly host: ZimDisplayerMatrix,
		public readonly drawDict: EntityDrawDict,
		initialData: IDisplayDataEntity<ESType>
	) {
		super()
		this.shapeInit(initialData)
	}

	override shapeInit(data: IDisplayDataEntity<ESType>): void {
		super.shapeInit(data)
		// ! 直接赋值（这里赋值的来源归根结底是`JSON.parse`，所以不用担心「共用引用」的问题）
		// !【2023-11-20 02:54:05】为避免部分实体更新时「数据不完整」的问题，这里需要先检查数据
		if (data.id !== undefined) this._currentEntityID = data.id
		else console.error('shapeInit: 数据`id`不完整！data =', data)
		if (data.state !== undefined) this._currentEntityState = data.state
		else console.error('shapeInit: 数据`state`不完整！data =', data)
		// 初始化 // !【2023-11-19 18:07:22】💭总不能旋转下玩家都重置吧
		this.initShapeByID()
	}

	override shapeRefresh(
		data: OptionalRecursive2<IDisplayDataEntity<ESType>>
	): void {
		// TODO: 这里逻辑有些混乱
		if (data?.id !== undefined) {
			// id「变化为非undefined」（原有对象复用）⇒预先销毁
			if (data?.id !== this._currentEntityID) {
				// 合并数据
				if (data.state !== undefined) {
					if (
						this._currentEntityState === null ||
						data.state === null
					)
						throw new Error(
							`在初始化的时候，理论上实体显示数据不可能为null！${String(
								this._currentEntityState
							)}, ${String(data.state)}`
						)
					mergeObject(data.state, this._currentEntityState)
				}
				// 更新id
				this._currentEntityID = data.id
				// 重新加载
				this.shapeDestruct()
			}
			// 更新id
			else this._currentEntityID = data.id
		}
		// 仅状态更新：根据ID更新状态 //
		// 通用更新
		if (data?.state !== undefined)
			// 更新状态
			mergeObject(data.state, this._currentEntityState)
		// 专用更新
		this.refreshShapeByID()
	}

	shapeDestruct(): void {
		// 清除绘图
		this.graphics.clear()
	}

	// 其它状态更新函数 //

	/** 根据ID调用相应「初始化」函数 */
	public initShapeByID(): void {
		if (
			this.drawDict?.[this._currentEntityID]?.init?.(
				this,
				this._currentEntityState
			) === undefined
		) {
			// * ID都没有，肯定是大忌
			if (this._currentEntityID === undefined) {
				console.error('实体ID未初始化！', this)
				throw new Error('实体ID未初始化！')
			}
			console.warn(
				'图形初始化失败：',
				this._currentEntityID,
				this._currentEntityState,
				this
			)
		}
	}
	/** 根据ID调用相应「初始化」函数 */
	public refreshShapeByID(): void {
		if (
			this.drawDict?.[this._currentEntityID]?.refresh?.(
				this,
				this._currentEntityState
			) === undefined
		) {
			// * ID都没有，肯定是大忌
			if (this._currentEntityID === undefined) {
				console.error('实体ID未初始化！', this)
				throw new Error('实体ID未初始化！')
			}
			console.warn(
				'图形刷新失败：',
				this._currentEntityID,
				this._currentEntityState,
				this
			)
		}
	}
}

/**
 * 「实体系统呈现者」
 * * 用于显示「一整个实体系统」，容纳方块并批量管理方块
 */
export class ZimDisplayerEntities
	// 作为「承载『方块图形』的容器」
	extends Container
	// 作为「实体数据」的显示器
	implements IStateDisplayer<IDisplayDataEntities>
{
	/** 构造函数 */
	public constructor(
		/** 所链接的「母体呈现者」（用于在地图和实体间交换信息） */
		public readonly host: ZimDisplayerMatrix,
		/** 所持有的「实体绘制函数」 */
		public readonly entityDrawDict: EntityDrawDict
	) {
		super()
	}

	/** 存储的「实体呈现者」列表 */
	protected _entities: { [uuid: string | uint]: ZimDisplayerEntity } = {}

	/** 获取指定uuid的「实体呈现者」 */
	protected getEntity(uuid: string | uint): ZimDisplayerEntity | undefined {
		return this._entities[uuid]
	}

	/** 在指定UUID处新增「实体呈现者」 */
	protected addEntity(
		uuid: string,
		initialData: IDisplayDataEntity<IDisplayDataEntityState>
	): ZimDisplayerEntity {
		const entityDisplayer = new ZimDisplayerEntity(
			this.host,
			this.entityDrawDict,
			initialData
		)
		entityDisplayer.shapeInit(initialData)
		this._entities[uuid] = entityDisplayer
		this.addChild(entityDisplayer)
		return entityDisplayer
	}

	/** 在指定id处删除实体；允许预先计算 */
	protected removeEntity(
		uuid: string,
		displayer: ZimDisplayerEntity = this._entities[uuid]
	): void {
		// 若有实体
		if (displayer !== undefined) {
			displayer.shapeDestruct()
			this.removeChild(displayer)
			delete this._entities[uuid]
		}
	}

	// 核心显示更新函数 //
	// ! 【2023-11-20 00:46:13】不要尝试把这俩循环抽象成一个函数，那样会让类型过度复杂化
	shapeInit(data: IDisplayDataEntities): void {
		let entityData: IDisplayDataEntity<IDisplayDataEntityState> | null
		let entityDisplayer: ZimDisplayerEntity | undefined
		// 遍历需要初始化的每个UUID（及其对应的实体）
		for (const uuid in data) {
			try {
				// 获取实体数据
				entityData = data[uuid] ?? null
				// 尝试（软）更新：有→更新，无→新建 // * 可能会存在「部分初始化」的现象？
				entityDisplayer = this.getEntity(uuid)
				if (entityDisplayer !== undefined) {
					// 空⇒移除
					if (entityData === null) this.removeEntity(uuid)
					// 有⇒更新
					else entityDisplayer.shapeInit(entityData)
				} else if (entityData !== null) {
					if (entityData?.id === undefined) {
						throw new Error('尝试在实体ID未提供时进行初始化！')
					}
					entityDisplayer = this.addEntity(
						uuid,
						// !【2023-11-19 15:04:37】这里默认「设置了空地方的数据」都是「需要初始化的数据」
						entityData
					)
				}
			} catch (e) {
				console.error(
					'初始化实体出现错误！',
					e,
					uuid,
					data,
					this._entities,
					this
				)
			}
		}
	}

	shapeRefresh(data: OptionalRecursive2<IDisplayDataEntities>): void {
		let entityData: OptionalRecursive2<
			IDisplayDataEntity<IDisplayDataEntityState>
		> | null
		let entityDisplayer: ZimDisplayerEntity | undefined
		// 遍历需要更新的每个UUID（及其对应的实体）
		for (const uuid in data) {
			try {
				// 获取实体数据
				entityData = data[uuid] ?? null
				// 尝试（软）更新：有→更新，无→新建 // * 可能会存在「部分初始化」的现象？
				entityDisplayer = this.getEntity(uuid)
				if (entityDisplayer !== undefined) {
					// 空⇒移除
					if (entityData === null) this.removeEntity(uuid)
					// 有⇒更新
					else entityDisplayer.shapeRefresh(entityData)
				} else if (entityData !== null) {
					// ! 不能说「既要申请一个新的『实体呈现者』又不一开始就拿到id初始化」
					if (entityData?.id === undefined) {
						throw new Error('尝试在实体ID未提供时进行初始化！')
					}
					entityDisplayer = this.addEntity(
						uuid,
						// !【2023-11-19 15:04:37】这里默认「设置了空地方的数据」都是「需要初始化的数据」
						entityData as IDisplayDataEntity<IDisplayDataEntityState>
					)
				}
			} catch (e) {
				console.error(
					'更新实体出现错误！',
					e,
					uuid,
					data,
					this._entities,
					this
				)
			}
		}
	}

	shapeDestruct(): void {
		// 遍历删除所有现有实体
		for (const uuid in this._entities) {
			this.removeEntity(uuid)
		}
		// 移除所有子对象 // ! 饱和式删除
		this.removeAllChildren()
	}
}
