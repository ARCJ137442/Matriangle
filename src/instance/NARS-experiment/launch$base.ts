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
import { chainApply } from 'matriangle-common/utils'
import { NARSEnvConfig } from './config/API'

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
