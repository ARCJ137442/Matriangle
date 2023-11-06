/**
 * 所有「启动文件」的「共用」版本
 * * Node/Browser 环境独立
 * * Car / Collision 实验独立
 * * 📍一般不会经常修改
 */
import { NARSEnv } from './NARSEnv'
import { chainApply } from 'matriangle-common/utils'
import { NARSEnvConfig } from './config/API'

/** 创建环境 */
export function envConstructor<ExtraConfig>(
	envConfigConstructor: (extraConfig: ExtraConfig) => NARSEnvConfig,
	extraConfig: ExtraConfig,
	...modifiers: ((env: NARSEnvConfig) => NARSEnvConfig)[]
): NARSEnv {
	return new NARSEnv(
		chainApply(
			// 环境配置构造器
			envConfigConstructor(
				// 构造器的额外配置
				extraConfig
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
