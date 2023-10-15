import {
	MatrixProgram,
	MatrixProgramLabel,
} from '../../../api/server/control/MatrixProgram'
import Entity from '../../../api/server/entity/Entity'
import { IEntityActive } from '../../../api/server/entity/EntityInterfaces'
import IMatrix from '../../../api/server/main/IMatrix'

/**
 * 「Agent」是
 * * 监控并清除「异常实体」的
 * 母体程序
 *
 * 💡灵感来自The Matrix
 * ```
 * 「监控函数+武器函数」，
 * 监控函数 (e:实体) => boolean
 * 武器函数 对实体使用的“函数武器”，(e:实体) => void
 *
 * 一个有趣的一点是，在程序的世界中，「函数」可以被作为一种武器，通过`武器(目标)`的形式简单表达「攻击该对象」
 * * 这一点是写就这个「类特工程序」的核心出发点之一
 * ```
 */
export default class ProgramAgent
	extends MatrixProgram
	implements IEntityActive
{
	/** 标签 */
	public static readonly LABEL: MatrixProgramLabel = 'AGENT' as const

	/**
	 * 默认「武器」
	 * @param host 所处在的「母体」
	 * @param target 打击的目标
	 */
	public static readonly DEFAULT_WEAPON = (
		host: IMatrix,
		target: Entity
	): void => void host.removeEntity(target)

	/**
	 * 默认「监控」
	 * @param host 所处在的「母体」
	 * @param e 被监控的实体
	 * @returns 是否「需要攻击」
	 */
	public static readonly DEFAULT_MONITOR = (
		host: IMatrix,
		e: Entity
	): boolean => !e.isActive

	/**
	 * 构造函数
	 */
	public constructor(
		/**
		 * 监控函数
		 * * 表示「是否需要武器清除」
		 */
		protected monitor: (
			host: IMatrix,
			e: Entity
		) => boolean = ProgramAgent.DEFAULT_MONITOR,
		/**
		 * 武器函数
		 * * 一般要用到「所在母体」
		 */
		protected weapon: (
			host: IMatrix,
			target: Entity
		) => void = ProgramAgent.DEFAULT_WEAPON
	) {
		super(ProgramAgent.LABEL)
	}

	// 活跃实体 //
	i_active = true as const

	/**
	 * @implements
	 * Purpose: 检测并清除异常
	 * * 检测「异常程序（实体）」
	 * * 使用「武器」（一般是「母体の删除函数」）攻击之
	 * @param host 所在母体
	 */
	onTick(host: IMatrix): void {
		// 扫描所有实体
		for (const e of host.entities) {
			// 监控「是否需要清除」
			if (this.monitor(host, e)) {
				// 根据「所在母体」使用「武器」攻击之（调用函数处理它）
				this.weapon(host, e)
			}
		}
	}
}
