/**
 * 专用：能量包收集实验
 * * 用于（已于2023-12-01首次完结的）「能量包收集」环境搭建
 * * 📍一般不会频繁更改
 */
import { NARSEnv } from './NARSEnv'
/* import experimentCarCollisionConfigConstructor, {
	ExtraCCExperimentConfig,
} from './config/Experiment-car-collision.config.template' */
import envConstructorPC, {
	PlayerMotorMode,
} from './config/Experiment-powerup-collecting.config.template'
import { chainApply, randomBoolean2 } from 'matriangle-common/utils'
import { NARSEnvConfig } from './config/API'
import { uint } from 'matriangle-legacy/AS3Legacy'

/** 构造「额外配置」 */
export const extraConfigConstructor = () => ({
	// 二维地图
	map_sizes: [5, 5],
	powerup: {
		// !【2023-11-06 22:55:27】当前测试：一边一个
		numGood: 1,
		numBad: 1,
	},
	// 先天知识
	intrinsicKnowledge: {
		// 告诉NARS「它有什么操作」
		whatOperationItHas: true,
		// 先天知识
		initialKnowledge: [
			// * 自身感知器信息（要自己填，因为后面随时有可能加）
			// * 作弊码
			// // <(&/, 正向能量包在前方, 一定时间) =/> 自身充能>.
		],
	},
	// 感知系统
	senseSys: {
		// 侧方感知
		sideSensory: true,
		// 前方感知
		frontSensory: true,
	},
	// 运动系统
	motorSys: {
		mode: PlayerMotorMode.INITIATIVE,
		// 被动模式的步进：频率为3
		passiveStepCriterion: (stepTick: uint): boolean => stepTick > 3,
	},
	// 动机系统
	motivationSys: {
		// 基础目标
		// goalBasic:'[powered]',
		goalBasic: '[satisfied]', // ! 对应OpenNARS内部NAL-9中的「情感机制」，是一个「硬编码特殊词项」 // * 参考OpenNARS 3.11源码`nars_core_java\nars\mental\Emotion.java`中的方法`public void adjustSatisfation(float newValue, float weight, Memory memory)`
		// 高阶目标
		highOrderGoals: false,
		highOrderGoal: '[powerful]', // 高阶目标：「有能量的」
		// 高阶目标「有能量的」：一个阈值
		powerfulCriterion: (timePassedLastBad: uint): boolean =>
			// *【2023-11-27 23:27:54】目前定高点没所谓，这和「时间颗粒」有关
			timePassedLastBad > 30,
		// 负触发目标
		negatriggerGoals: false, // !【2023-11-27 00:27:39】目前启用
		// 高阶目标「有能量的」：一个阈值
		negatriggerCriterion: (timePassedLastGood: uint): boolean =>
			// *【2023-11-27 23:27:54】目前定高点没所谓，这和「时间颗粒」有关
			timePassedLastGood > 30 && randomBoolean2(0.25), // 暂时不要定这么快，不然太饥饿了系统容易崩
		// 负触发目标的真值函数
		negatriggerTruthF: (timePassedLastGood: uint): [number, number] =>
			// *【2023-11-27 23:27:54】目前定高点没所谓，这和「时间颗粒」有关
			[
				// 频率
				1 / (timePassedLastGood + 1), // 暂时不要定这么快，不然太饥饿了系统容易崩
				// 信度
				0.9, // 这是默认值
			],
	},
})

/** 创建环境 */
export function envConstructor(
	...modifiers: ((env: NARSEnvConfig) => NARSEnvConfig)[]
): NARSEnv {
	return new NARSEnv(
		chainApply(
			// ! 原配置（决定「实验之所以是这个实验」）
			envConstructorPC(
				// * 加之于「原始实验配置」的额外配置（用于控制变量）
				extraConfigConstructor()
			),
			// 构造器的额外修改
			...modifiers
		)
	)
}

/** 环境修饰器 */
export const envModifiers_default: ((env: NARSEnvConfig) => NARSEnvConfig)[] = [
	/* 暂时没有额外的配置 */
]

// 启动代码也不会在此执行
