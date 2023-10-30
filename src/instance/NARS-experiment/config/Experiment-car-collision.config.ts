import { iPoint } from 'matriangle-common'
import { NARSEnvConfig, NARSOperation } from './API'
import plotConfig from './PlotData-NARS.config'
import IMatrix from 'matriangle-api/server/main/IMatrix'
import IPlayer from 'matriangle-mod-native/entities/player/IPlayer'
import { NARSEnv } from '../server'
import { nameOfAxis_M } from 'matriangle-api'
import { PlayerEvent } from 'matriangle-mod-native'
import { getAddress } from 'matriangle-mod-message-io-api'

const config: NARSEnvConfig = {
	// 根据自身输出 实验/配置 信息
	info: (config: NARSEnvConfig): string => `
	[[实验：NARS小车碰撞]]

	[实验主要组成部分]
	1. NARS服务器：参与实验的AI，能通过文本方式向实验环境收发信息
	2. Matriangle服务端：运行实验环境，向AI提供「感知」并执行AI所发送的「操作」
	3. Web客户端：呈现Matriangle的模拟环境，并统计其内部产生的数据
	总体连接结构：NARS服务器 ⇄ Matriangle服务端 ⇄ Web客户端

	[注意事项]
	1. 推荐的启动顺序：NARS服务器⇒Web客户端⇒Matriangle服务端
	  - 原理：先启动连接的两端，再启动中间——确保NARS不受「先前经验污染」，保证服务端被客户端连接
	2. 对应客户端的启动目录：相应WebUI中的index.html
	  - 若客户端后启动，部分连接可能无法建立
	3. NARS服务器需要监听 ${getAddress(
		config.connections.NARS.host,
		config.connections.NARS.port
	)} 的服务地址，以便实验环境对接
	  - 这个连接主要用于向NARS实现（如OpenNARS、ONA、PyNARS）输入感知运动信息'
	`,
	// 网络连接地址
	connections: {
		controlService: { host: '127.0.0.1', port: 3002 },
		// 按上面的重构一下
		displayService: { host: '127.0.0.1', port: 8080 },
		dataShowService: { host: '127.0.0.1', port: 3030 },
		NARS: { host: '127.0.0.1', port: 8765 },
	},

	// 词项常量池 & 词法模板
	NAL: {
		SELF: '{SELF}',
		SAFE: '[SAFE]',
		positiveTruth: '%1.0;0.9%',
		negativeTruth: '%0.0;0.9%',
		/** 操作符带尖号，模板：OpenNARS输出`^left([{SELF}, x])` */
		op_output: (op: NARSOperation): string =>
			`${op[0]}([${op.slice(1).join(', ')}])`,
		/** 操作符带尖号，模板：语句`<(*, {SELF}, x) --> ^left>` */
		op_input: (op: NARSOperation): string =>
			`<(*, ${op.slice(1).join(', ')}) --> ${op[0]}>`,
	},

	// 计时参数
	timing: {
		/** 单位执行速度:感知 */
		unitAITickSpeed: 1,
		/** 目标提醒相对倍率 */
		goalRemindRate: 3, // 因子「教学目标」 3 5 10 0x100000000

		/** Babble相对倍率 */
		babbleRate: 1,
		/** 「长时间无操作⇒babble」的阈值 */
		babbleThreshold: 1,
	},

	// 地图参数
	map: {
		/** 地图尺寸 */
		SIZES: new iPoint().copyFromArgs(
			// 【2023-10-27 16:51:08】目前是二维
			5,
			5
		),
	},

	// 绘图参数：直接引用外部配置
	plot: plotConfig,
	behavior: {
		/** @implements 实现：初始化 */
		init: (
			env: NARSEnv,
			event: PlayerEvent,
			self: IPlayer,
			host: IMatrix,
			registerOperation: (op: [string, ...string[]]) => void
		): void => {
			// 「方向控制」消息 // * 操作：`移动(自身)` 即 `(*, 自身) --> ^移动`
			let name: string
			// * 基于先前与他人的交流，这里借用「left⇒负方向移动，right⇒正方向移动」「同操作符+不同参数≈不同操作」的思想，使用「^left({SELF}, x)」表达「向x轴负方向移动」（其它移动方式可类推）
			const rl = ['right', 'left'] // 先右后左，先正后负
			for (name of rl) {
				// 遍历各个维度，产生操作
				for (let i = 0; i < host.map.storage.numDimension; ++i) {
					// 负/正方向 //
					registerOperation([
						// * 样例：['^left', '{SELF}', 'x']
						'^' + name, // 朝负/正方向 // ! 不要忘记尖号
						env.config.NAL.SELF,
						nameOfAxis_M(i),
					])
				}
			}
		},
		/** @implements 实现：位置感知 */
		AITick: (
			env: NARSEnv,
			event: PlayerEvent,
			self: IPlayer,
			host: IMatrix,
			posPointer: iPoint,
			send2NARS: (message: string) => void
		): void => {
			// 指针归位
			posPointer.copyFrom(self.position)
			for (let i = 0; i < host.map.storage.numDimension; ++i) {
				// 负半轴
				posPointer[i]--
				if (!self.testCanGoTo(host, posPointer)) {
					send2NARS(
						`<${env.config.NAL.SELF} --> [${nameOfAxis_M(
							i
						)}_left_blocked]>. :|: ${env.config.NAL.positiveTruth}`
					)
				}
				// 从负到正
				posPointer[i] += 2
				if (!self.testCanGoTo(host, posPointer)) {
					send2NARS(
						`<${env.config.NAL.SELF} --> [${nameOfAxis_M(
							i
						)}_right_blocked]>. :|: ${env.config.NAL.positiveTruth}`
					)
				}
				// 归位⇒下一座标轴
				posPointer[i]--
			}
		},
		/** @implements babble：取随机操作 */
		babble: (env: NARSEnv, self: IPlayer, host: IMatrix): NARSOperation =>
			env.randomRegisteredOperation(),
	},
}
export default config
