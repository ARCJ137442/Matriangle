import { uint } from 'matriangle-legacy/AS3Legacy'
import { MatrixProgramLabel } from 'matriangle-api/server/control/MatrixProgram'
import WebMessageRouter from '../WebMessageRouter'
import { NativeWebServiceType } from '../WebMessageRouter'
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
	 * 以指定IP、端口连接到「消息路由器」
	 * * 与「开设服务器」不同的是：所有逻辑由自身决定
	 *
	 * !【2023-10-12 21:33:49】暂时不进行通用化（IMessageRouter）处理
	 *
	 * @type {NativeWebServiceType}
	 * @param {string} ip 开放的地址
	 * @param {uint} port 开放的服务端口
	 * @param {WebMessageRouter} router 所连接的「消息路由器」
	 */
	public linkToRouter(
		router: WebMessageRouter,
		type: NativeWebServiceType,
		ip: string,
		port: uint
	): boolean {
		return router.registerServiceWithType(
			type,
			ip,
			port,
			this.onMessage.bind(this),
			(): void => {
				console.log(`与路由器成功在${type}://${ip}:${port}建立连接！`)
			}
		)
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
