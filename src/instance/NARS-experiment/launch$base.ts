/**
 * 主文件（基础/实验版本）
 * * 🔬可能经常被修改，以用于实验
 * * Node/Browser 独立
 *   * Vue组件在引用此库时，只需从`launch-browser`中引入，无需为此引入额外的Node模块
 */
import { NARSEnv } from './NARSEnv'
/* import experimentCarCollisionConfigConstructor, {
	ExtraCCExperimentConfig,
} from './config/Experiment-car-collision.config.template' */
import envConstructorPC from './config/Experiment-powerup-collecting.config.template'
import { chainApply, randomBoolean2 } from 'matriangle-common/utils'
import { NARSEnvConfig } from './config/API'
import { uint } from 'matriangle-legacy/AS3Legacy'

/** 创建环境 */
export function envConstructor(
	...modifiers: ((env: NARSEnvConfig) => NARSEnvConfig)[]
): NARSEnv {
	return new NARSEnv(
		chainApply(
			// ! 原配置
			envConstructorPC(
				// 构造器的额外配置
				{
					// 二维地图
					map_sizes: [5, 5],
					powerup: {
						// !【2023-11-06 22:55:27】当前测试：一边一个
						numGood: 1,
						numBad: 1,
					},
					// 每次以一半的概率步进
					stepProbability: 0.5,
					// 高阶目标
					highOrderGoals: false, // !【2023-11-27 00:27:39】目前启用
					// 高阶目标「有能量的」：一个阈值
					powerfulCriterion: (timePassedLastBad: uint): boolean =>
						// *【2023-11-27 23:27:54】目前定高点没所谓，这和「时间颗粒」有关
						timePassedLastBad > 30,
					// 负触发目标
					negatriggerGoals: true, // !【2023-11-27 00:27:39】目前启用
					// 高阶目标「有能量的」：一个阈值
					negatriggerCriterion: (timePassedLastGood: uint): boolean =>
						// *【2023-11-27 23:27:54】目前定高点没所谓，这和「时间颗粒」有关
						timePassedLastGood > 30 && randomBoolean2(0.25), // 暂时不要定这么快，不然太饥饿了系统容易崩
					// 负触发目标的真值函数
					negatriggerTruthF: (
						timePassedLastGood: uint
					): [number, number] =>
						// *【2023-11-27 23:27:54】目前定高点没所谓，这和「时间颗粒」有关
						[
							// 频率
							1 / (timePassedLastGood + 1), // 暂时不要定这么快，不然太饥饿了系统容易崩
							// 信度
							0.9, // 这是默认值
						],
				}
			),
			...modifiers
		)
	)
}

/** 环境修饰器 */
export const envModifiers_default: ((env: NARSEnvConfig) => NARSEnvConfig)[] = [
	/* 暂时没有额外的配置 */
]

// 启动代码也不会在此执行
