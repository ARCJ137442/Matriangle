import { MessageServiceConstructor, NARSEnvConfig } from './API'
import { DirectService } from 'matriangle-mod-message-io-api/services/DirectService'
import {
	MessageCallback,
	IMessageService,
} from 'matriangle-mod-message-io-api/MessageInterfaces'
import { uint } from 'matriangle-legacy/AS3Legacy'
import { dictionaryPatternReplace } from 'matriangle-common/utils'
import MessageRouter from 'matriangle-mod-message-io-api/MessageRouter'
import { WebSocketServiceClient } from 'matriangle-mod-message-io-browser/services'

// 需复用的常量
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
 * @param originalConfig 原始「NARS环境配置」
 * @param clientRouter 用来让「直连服务」建立连接的消息路由器（连接的目标，如「前端Vue服务的路由器」）
 * @returns NARS环境配置
 */
export default function (
	originalConfig: NARSEnvConfig,
	clientRouter: MessageRouter
): NARSEnvConfig {
	/** 构造直连服务 */
	const directServiceConstructor = (
		host: string,
		port: uint,
		messageCallback: MessageCallback
	): IMessageService =>
		new DirectService(host, port, messageCallback, clientRouter)

	// * 下面这个命令是为了利用TS语法提示，防止后续重构时无法更新字符串表示的路径
	void originalConfig.connections.controlService.constructor

	/** 核心 模式替换：把所有「玩家用服务」「背景服务」都替换成「直连服务」 */
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
			console.log('替换：', service, '=>', directServiceConstructor)
			return directServiceConstructor
		}
	)

	// * 下面这个命令是为了利用TS语法提示，防止后续重构时无法更新字符串表示的路径
	void originalConfig.players[0]?.connections.NARS.constructor
	/** 核心 模式替换：把所有「NARS用服务」替换成「WS客户端服务」（覆盖先前选项） */
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
	console.log('替换完毕！', originalConfig)
	return originalConfig
}
