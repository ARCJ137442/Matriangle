import { MessageServiceConstructor, NARSEnvConfig } from './API'
import { IMessageService, MessageCallback } from 'matriangle-mod-message-io-api'
import { uint } from 'matriangle-legacy'
import { dictionaryPatternReplace } from 'matriangle-common'
import {
	WebSocketServiceClient,
	WebSocketServiceServer,
} from 'matriangle-mod-message-io-node'

// 需复用的常量
/** 构造Websocket服务端服务（Node环境） */
const WSServiceServerConstructor: MessageServiceConstructor = (
	host: string,
	port: uint,
	messageCallback: MessageCallback
): IMessageService => new WebSocketServiceServer(host, port, messageCallback)
/** 构造Websocket客户端服务（Node环境） */
const WSServiceClientConstructor: MessageServiceConstructor = (
	host: string,
	port: uint,
	messageCallback: MessageCallback
): IMessageService => new WebSocketServiceClient(host, port, messageCallback)

/**
 * 「NARS环境配置」的构造函数
 * * 通过传入参数来修改「环境配置」
 *
 * ! 原地操作：会修改原始配置
 *
 * @param clientRouter 用来让「直连服务」建立连接的消息路由器
 * @returns NARS环境配置
 */
/**
 * 「NARS环境配置」的构造函数
 * * 通过传入参数来修改「环境配置」
 *
 * ! 原地操作：会修改原始配置
 *
 * @param clientRouter 用来让「直连服务」建立连接的消息路由器
 * @returns NARS环境配置
 */
export default function (originalConfig: NARSEnvConfig): NARSEnvConfig {
	// * 下面这个命令是为了利用TS语法提示，防止后续重构时无法更新字符串表示的路径
	void originalConfig.connections.controlService.constructor

	/** 核心 模式替换：把所有「背景服务」「玩家服务」替换成「Node服务端服务」 */
	dictionaryPatternReplace(
		originalConfig,
		[
			// 图式：connections.*.constructor // * 匹配所有「环境连接」中的构造器
			'connections',
			null,
			'constructor',
		],
		// 替换成「直连服务」
		(service: unknown): MessageServiceConstructor => {
			console.log('替换：', service, '=>', WSServiceServerConstructor)
			return WSServiceServerConstructor
		}
	)

	void originalConfig.players[0]?.connections.NARS.constructor
	/** NARS 模式替换：把所有「玩家NARS用服务」替换成「Node客户端服务」（覆盖「核心」替换） */
	dictionaryPatternReplace(
		originalConfig,
		[
			// 图式：connections.*.constructor // * 匹配所有「玩家连接」中的构造器
			'players',
			null,
			'connections',
			'NARS',
			'constructor',
		],
		// 替换成「WS客户端服务」
		(service: unknown): MessageServiceConstructor => {
			console.log('替换：', service, '=>', WSServiceClientConstructor)
			return WSServiceClientConstructor
		}
	)

	return originalConfig
}
