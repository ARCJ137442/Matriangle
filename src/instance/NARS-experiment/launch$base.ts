/**
 * 主文件（基础版本）
 * * 不包含「Node/浏览器」的「环境信息」
 *   * 环境信息另行提供
 *   * Vue组件在引用此库时，只需从`launch-base`中引入，无需为此引入额外的Node模块
 */
import { NARSEnv } from './NARSEnv'
import experimentCarCollisionConfigConstructor, {
	ExtraCCExperimentConfig,
} from './config/Experiment-car-collision.config.template'
import { chainApply } from 'matriangle-common/utils'
import { NARSEnvConfig } from './config/API'

/** 创建环境 */
export function envConstructor(
	extraConfig: ExtraCCExperimentConfig,
	...modifiers: ((env: NARSEnvConfig) => NARSEnvConfig)[]
): NARSEnv {
	return new NARSEnv(
		chainApply(
			// ! 原配置
			experimentCarCollisionConfigConstructor(extraConfig),
			...modifiers
		)
	)
}

/** 环境修饰器 */
export const envModifiers_default: ((env: NARSEnvConfig) => NARSEnvConfig)[] = [
	/* 暂时没有额外的配置 */
]

// 启动代码也不会在此执行
