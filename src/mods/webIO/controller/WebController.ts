import { uint } from 'matriangle-legacy/AS3Legacy'
import { MatrixProgramLabel } from 'matriangle-api/server/control/MatrixProgram'
import {
	IMessageRouter,
	IMessageService,
	MessageCallback,
	MessageServiceConfig,
	linkToRouterLazy,
} from '../../message-io-api/MessageInterfaces'
import MultiKeyController from './MultiKeyController'

/**
 * 「网络控制器」是
 * * 与「网络消息路由器」对接，而无需自行搭建服务器的
 * 多键控制器
 */
export default class WebController extends MultiKeyController {
	/** 共同的标签：Web控制器 */
	public static readonly LABEL: MatrixProgramLabel = 'WebController'

	// 构造函数&析构函数 //

	/**
	 * 构造函数
	 * * 不包括IP、端口的注册
	 */
	public constructor() {
		super(WebController.LABEL)
	}

	// 服务器部分 //
	/**
	 * 以指定服务连接到「消息路由器」
	 * * 会更改传入
	 * * 与「开设服务器」不同的是：所有逻辑由自身决定
	 *
	 * @type {MessageServiceType}
	 * @param {IMessageService} service 用于注册的服务
	 * @param {MessageRouter} router 所连接的「消息路由器」
	 */
	public linkToRouter(
		router: IMessageRouter,
		service: IMessageService
	): boolean {
		service.messageCallback = this.onMessage.bind(this)
		return router.registerService(service, (): void => {
			console.log(`与路由器成功在 ${service.addressFull} 建立连接！`)
		})
	}

	/**
	 * 以指定服务连接到「消息路由器」，但是「懒注册」
	 * * 只有在「可以注册」（路由器地址未注册）时构造路由器
	 * * 会暴露自身的「内部消息接收接口」以便「为『消息服务』绑定『消息回调函数』」
	 * * 与「开设服务器」不同的是：所有逻辑由自身决定
	 *
	 * @param {MessageRouter} router 所连接的「消息路由器」
	 * @param {string} host 主机地址
	 * @param {uint} port 服务端口
	 * @param {(messageCallback: MessageCallback) => IMessageService} serviceF 用于注册的「服务构造函数」
	 * @returns {boolean} 是否注册成功（先前未有注册）
	 */
	public linkToRouterLazy(
		router: IMessageRouter,
		host: string,
		port: uint,
		serviceF: (messageCallback: MessageCallback) => IMessageService
	): boolean {
		if (router.hasServiceAt(host, port)) return false
		else {
			const service: IMessageService = serviceF(this.onMessage.bind(this))
			return router.registerService(service, (): void => {
				console.log(`与路由器成功在 ${service.addressFull} 建立连接！`)
			})
		}
	}

	/**
	 * 以指定服务连接到「消息路由器」，但是「懒懒注册」
	 * * 直接使用「消息服务配置」进行连接
	 * * 📌这里的「消息回调函数」直接向内指向自身{@link onMessage}方法
	 *
	 * !【2023-11-18 18:04:14】这里直接使用「消息服务接口」提供的方法，但在此传递内部函数{@link onMessage}以便进行封装
	 *
	 * @param {MessageRouter} router 所连接的「消息路由器」
	 * @param {MessageServiceConfig} config 消息服务配置
	 * @returns {boolean} 是否注册成功（先前未有注册）
	 */
	public linkToRouterLLazy(
		router: IMessageRouter,
		config: MessageServiceConfig
	): boolean {
		return linkToRouterLazy(router, config, this.onMessage.bind(this))
	}

	/**
	 * 消息侦听
	 * * 格式：`控制密钥|分派动作`
	 *   * 💭这意味着「控制密钥」不能使用「|」字符
	 *
	 * @param message 收到的「8bit数据缓冲区」（需要使用`String.fromCodePoint`方法）
	 */
	protected onMessage(message: string): undefined {
		// 解析消息
		let controlKey: string, action: string
		try {
			// !【2023-10-06 22:15:57】这要求消息格式必须是二元组
			;[controlKey, action] = message.split('|')
		} catch (e) {
			console.error(`消息「${message}」解析失败！`, e)
			return
		}
		// 根据消息分派操作
		this.dispatchByControlKey(controlKey, action)
		// 无需响应
		return undefined
	}
}
