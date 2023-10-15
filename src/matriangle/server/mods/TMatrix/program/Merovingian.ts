import { contains } from '../../../../common/utils'
import {
	MatrixProgram,
	MatrixProgramLabel,
} from '../../../api/control/MatrixProgram'
import Entity from '../../../api/entity/Entity'
import {
	IEntityActive,
	i_shortLive,
} from '../../../api/entity/EntityInterfaces'
import IMatrix from '../../../main/IMatrix'

/**
 * 这个类其实有一部分是在实验JS「动态类型特性」中的「任意属性均可黑」「实例方法亦可改」的特性
 */
export default class ProgramMerovingian
	extends MatrixProgram
	implements IEntityActive
{
	/** 标签 */
	public static readonly label: MatrixProgramLabel = 'Merovingian' as const
	/**
	 * 默认的「私藏函数」
	 * * 逻辑：只要不是「短命的」就行
	 */
	public static readonly DEFAULT_WANTS: (
		host: IMatrix,
		e: Entity
	) => boolean = (host: IMatrix, e: Entity): boolean => !i_shortLive(e)

	/**
	 * 默认的「放回函数」
	 * * 逻辑：母体内实体数 < 5
	 */
	public static readonly DEFAULT_PUSH_BACKS: (
		host: IMatrix,
		e: Entity
	) => boolean = (host: IMatrix, e: Entity): boolean =>
		host.entities.length < 5

	/**
	 * 构造函数
	 */
	constructor(
		/**
		 * 被这个程序从母体中私藏起来的、本该被删除的实体
		 */
		public readonly privatePossessions: Entity[] = [],
		/**
		 * 决定这个程序「私藏」的偏好
		 */
		public readonly wants: (
			host: IMatrix,
			e: Entity
		) => boolean = ProgramMerovingian.DEFAULT_WANTS,
		/**
		 * 决定这个程序「放回到某个母体」的偏好
		 */
		public readonly pushBacks: (
			host: IMatrix,
			e: Entity
		) => boolean = ProgramMerovingian.DEFAULT_PUSH_BACKS
	) {
		super(ProgramMerovingian.label)
	}

	// 活跃实体 //
	i_active = true as const

	/**
	 * @implements
	 *
	 * 根据条件将实体放回到母体中
	 * * 遵循「先进先出」的前因后果
	 * * 也有可能将其「走私」到这个母体（若其同时黑掉了多个母体的话）
	 */
	onTick(host: IMatrix): void {
		// 有私藏⇒检查第一个
		if (
			this.privatePossessions.length > 0 &&
			this.pushBacks(host, this.privatePossessions[0])
		) {
			// 重新激活
			this.privatePossessions[0].isActive = true
			// 放回母体
			host.addEntity(this.privatePossessions.shift() as Entity)
		}
	}
	protected _temp_toPushBack_E?: Entity

	public hack(matrix: IMatrix): void {
		// 预先检测「是否有黑过」，黑过⇒无需再黑
		matrix.removeEntity(this)
		if (contains(matrix.entities, this)) return
		matrix.addEntity(this)

		// 篡改函数
		const oldF: (entity: Entity) => boolean =
			matrix.removeEntity.bind(matrix)
		;(matrix.removeEntity as unknown) = (entity: Entity): boolean => {
			// 保护自己
			if (entity === this) {
				console.info(`Aucun programme ne peut Me Supprimer.`)
				// 非激活⇒重新激活
				if (!this._isActive) this.isActive = true
				return false
			}
			// 执行原先的「母体逻辑」
			const oldResult = oldF(entity)
			// 「应该被删除」但「自己想要」⇒私藏它
			if (oldResult)
				if (this.wants(matrix, entity))
					this.privatePossessions.push(entity)
			return oldResult
		}
	}
}
