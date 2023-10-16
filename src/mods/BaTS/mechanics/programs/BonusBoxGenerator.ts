import { iPointRef } from '../../../../common/geometricTools'
import { uint } from '../../../../legacy/AS3Legacy'
import { MatrixProgramLabel } from '../../../../api/server/control/MatrixProgram'
import { IEntityActive } from '../../../../api/server/entity/EntityInterfaces'
import IMatrix from '../../../../api/server/main/IMatrix'
import IMatrixRule from '../../../../api/server/rule/IMatrixRule'
import { MatrixRules_Batr } from '../../../native/rule/MatrixRules_Batr'
import { BonusType } from '../../registry/BonusRegistry'
import {
	addBonusBoxInRandomTypeByRule,
	getBonusBoxCount,
} from '../BatrMatrixMechanics'
import { getPlayers } from '../../../native/mechanics/NativeMatrixMechanics'
import BlockRandomTickDispatcher from './BlockRandomTickDispatcher'

/**
 * 「奖励箱生成者」是
 * * 活跃的
 * * 每个游戏刻有一定几率触发「生成奖励箱」，并根据自身配置生成与放置奖励箱的
 * * 作为AS3版本「随机奖励箱机制」继任者的
 * 方块随机刻分派者
 */
export default class BonusBoxGenerator
	extends BlockRandomTickDispatcher
	implements IEntityActive
{
	/** 标签 */
	public static readonly LABEL: MatrixProgramLabel = 'BonusBoxGenerator'

	// 构造&析构 //
	public constructor(
		/**
		 * 世界环境中允许（奖励箱生成器）生成的「最大奖励箱数量」
		 * * 0⇒无限生成
		 * * 若需关闭生成，可设置`spawnChance=0`
		 */
		public maxCount: uint,
		/**
		 * 世界环境中在每个游戏刻尝试生成奖励箱的几率
		 */
		public spawnChance: number,
		/**
		 * 奖励类型→权重
		 * * 只在「世界加载」阶段被注册使用。
		 * * 一般会与「母体规则」共享引用
		 */
		public bonusTypePotentials: Map<BonusType, number>
	) {
		super(BonusBoxGenerator.LABEL)
	}

	/**
	 * 快速从「母体规则」中导入
	 * * 但使用了「Batr规则」的键
	 *
	 * @param rule 用于载入数据的「母体规则」
	 */
	public static fromBatrRule(rule: IMatrixRule): BonusBoxGenerator {
		return new BonusBoxGenerator(
			rule.safeGetRule<uint>(MatrixRules_Batr.key_bonusBoxMaxCount),
			rule.safeGetRule<number>(MatrixRules_Batr.key_bonusBoxSpawnChance),
			rule.safeGetRule<Map<BonusType, number>>(
				MatrixRules_Batr.key_bonusTypePotentials
			)
		)
	}

	/**
	 * @override 重载：以一定几率触发
	 */
	override onTick(host: IMatrix): void {
		// 随机几率
		if (Math.random() < this.spawnChance)
			if (this.maxCount < 1 || getBonusBoxCount(host) < this.maxCount)
				// 最大数量
				super.onTick(host)
	}

	/**
	 * @override 重载：生成奖励箱
	 */
	override dispatch(host: IMatrix, position: iPointRef): void {
		// 躲避玩家
		if (host.map.testBonusBoxCanPlaceAt(position, getPlayers(host)))
			addBonusBoxInRandomTypeByRule(host, position)
	}
}
