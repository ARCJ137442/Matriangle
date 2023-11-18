import IMatrix from 'matriangle-api/server/main/IMatrix'
import IMap from 'matriangle-api/server/map/IMap'
import IMatrixStartupConfig from 'matriangle-api/server/rule/IMatrixStartupConfig'
import { uint } from 'matriangle-legacy'
import { BatrDefaultMaps } from 'matriangle-mod-bats'
import {
	MessageCallback,
	MessageServiceConfig,
} from 'matriangle-mod-message-io-api'
import { WebSocketServiceServer } from 'matriangle-mod-message-io-node'
import MapStorageSparse from 'matriangle-mod-native/map/MapStorageSparse'
import Map_V1 from 'matriangle-mod-native/map/Map_V1'
import MatrixVisualizer from 'matriangle-mod-visualization/visualizer/MatrixVisualizer'
import MatrixVisualizerCanvas from 'matriangle-mod-visualization/visualizer/MatrixVisualizerCanvas'
import MatrixVisualizerText from 'matriangle-mod-visualization/visualizer/MatrixVisualizerText'
import { stackMaps } from './stackedMaps'
import { randInt, randomBoolean2 } from 'matriangle-common'

const visualizationConstructors = {
	canvas: (host: IMatrix): MatrixVisualizer =>
		new MatrixVisualizerCanvas(host),
	text: (host: IMatrix): MatrixVisualizer => new MatrixVisualizerText(host),
}

/**
 * 新的「BaTS服务器专用」类型
 */
export interface IMatrixStartupConfigBaTS extends IMatrixStartupConfig {
	/**
	 * 用于构造「可视化程序」的构造函数
	 * * 例：`new MatrixVisualizerText(host)`
	 */
	visualizationConstructor: (host: IMatrix) => MatrixVisualizer
	/**
	 * 记录各个（消息服务的）连接配置
	 */
	connections: {
		/**
		 * 「控制服务」的配置
		 */
		control: MessageServiceConfig
		/**
		 * 「可视化服务」的配置
		 */
		visualization: MessageServiceConfig
	}
	maps: IMap[]
}

/** 构造「Websocket服务器」消息服务的构造函数 */
const constructorWSServer = (
	host: string,
	port: uint,
	messageCallback: MessageCallback
) => new WebSocketServiceServer(host, port, messageCallback)

/**
 * 一个用于「配置母体启动」的配置对象
 * * 🔬可能经常被修改
 *
 * ! 与「规则」的区别：只在「母体启动」时用到
 * * 不会影响母体启动后的运作
 */
const config: IMatrixStartupConfigBaTS = {
	// !【2023-11-18 16:55:20】目前是用canvas
	visualizationConstructor: visualizationConstructors.canvas,
	// !【2023-11-18 17:42:00】固定的常量配置
	connections: {
		control: {
			host: '127.0.0.1',
			port: 3002,
			constructor: constructorWSServer,
		},
		visualization: {
			host: '127.0.0.1',
			port: 8080,
			constructor: constructorWSServer,
		},
	},
	// 地图
	// [...MULTI_DIM_TEST_MAPS, ...BatrDefaultMaps._ALL_MAPS]; // 【2023-10-09 21:12:37】目前是「多维度地图」测试
	maps: [
		new Map_V1(
			'stacked',
			stackMaps(
				(randomBoolean2()
					? BatrDefaultMaps._ALL_MAPS
					: BatrDefaultMaps._ALL_MAPS.slice(
							1,
							randInt(BatrDefaultMaps._ALL_MAPS.length) + 1
					  )
				).map(
					(map: IMap): MapStorageSparse =>
						map.storage as MapStorageSparse
				)
			)
		),
	],
	// 其它配置
	playerCount: 1,
	AICount: 3,
}

export default config
