import { randInt } from "../../../../../../common/exMath";
import { int, uint } from "../../../../../../legacy/AS3Legacy";
import { MatrixControllerLabel } from "../../../../../api/control/MatrixControl";
import { TPS } from "../../../../../main/GlobalGameVariables";
import IBatrMatrix from "../../../../../main/IBatrMatrix";
import BonusBox from "../../item/BonusBox";
import IPlayer from "../IPlayer";
import { ADD_ACTION, EnumPlayerAction, PlayerAction } from "./PlayerAction";
import PlayerController from "./PlayerController";
import { createServer, Server, IncomingMessage, ServerResponse } from 'node:http'
import { ParsedUrlQuery, parse } from "node:querystring";

/**
 * 「HTTP控制器」
 * * 启动一个HTTP服务器，接收外界服务器请求
 * * 使用「控制密钥」机制，以实现「一个服务器运行，指挥多个玩家」（需要在query中提供）
 *   * 「控制密钥」相同的玩家会被同时分派相同的动作
 * * 请求格式：`?key=控制密钥&action=分派动作`
 *   * 实际情况请参考类常量`KEY_CONTROL_KEY`与`KEY_ACTION`
 * * 连接玩家时，
 *   * 可以通过「生成订阅」直接创建链接（此时密钥=玩家名称）
 *   * 也可以通过「添加链接」自定义「控制密钥」
 * 
 * ! 这个控制器需要`Node.js`支持
 */
export default class HTTPController extends PlayerController {

	/** 共同的标签：HTTP控制器 */
	public static readonly LABEL: MatrixControllerLabel = 'HTTP';

	/** 「控制密钥」的查询键 */
	public static readonly KEY_CONTROL_KEY: string = 'key';
	/** 「分派动作」的查询键 */
	public static readonly KEY_ACTION: string = 'action';

	/**
	 * 主机名称，如：
	 * * 本地主机`localhost`
	 * * 0.0.0.0
	 */
	protected _hostname: string = 'localhost';
	public get hostname(): string { return this._hostname }

	/**
	 * 端口
	 */
	protected _port: uint = 8080;
	public get port(): uint { return this._port }

	/**
	 * 存储当前HTTP服务器
	 */
	protected _server?: Server;


	/**
	 * 构造函数
	 * * 不包括IP、端口的注册
	*/
	public constructor() {
		super(HTTPController.LABEL);
	}

	/**
	 * 析构函数
	 * * 关闭可能开启的服务器，避免IP/端口占用
	 */
	override destructor(): void {
		this.stopServer();
	}

	// 服务器部分 //
	/**
	 * 启动HTTP服务器
	 */
	public launchServer(ip: string, port: uint) {
		this._hostname = ip;
		this._port = port;
		// 创建服务器，并开始侦听
		try {
			this._server = createServer(this.onRequest.bind(this));
			this._server.listen(
				this._port, this._hostname,
				(): void => {
					// 启动成功
					console.log(
						`HTTP服务器启动成功，地址：http://${this._hostname}:${this._port}/`,
					);
				}
			);
		}
		catch (e) {
			console.error(`HTTP服务器${this._hostname}:${this._port}启动失败！`, e);
		}
	}

	/**
	 * 终止HTTP服务器
	 */
	public stopServer() {
		this._server?.close(() => {
			console.log(`HTTP服务器${this._hostname}: ${this._port}已关闭！`);
			// 这里可以执行一些清理操作或其他必要的处理
		});
	}
	/**
	 * 请求侦听函数
	 * 
	 * @param req 收到的请求
	 * @param res 预备的响应
	 */
	public onRequest(req: IncomingMessage, res: ServerResponse): void {
		// 解析请求
		let queries: ParsedUrlQuery = parse(
			req.url?.slice( // 截取出「?`a = 1 & b=2`...」
				req.url.indexOf('?') + 1
			) ?? ''
		)
		let controlKey: string | string[] | undefined = queries?.[HTTPController.KEY_CONTROL_KEY];
		let action: string | string[] | undefined = queries?.[HTTPController.KEY_ACTION];
		let responseText: string = `No response of ${req.url}\n`;
		// 根据请求分派操作 // ! 目前只有「控制密钥」与「分派动作」均为字符串时才分派
		if (typeof controlKey === 'string' && typeof action === 'string') {
			this.dispatchByControlKey(controlKey, action);
			responseText = `Action { ${controlKey}: ${action} } dispatched.\n`
		}
		// 响应请求
		res.writeHead(200, { 'Content-Type': 'text/plain' });
		res.end(responseText);
	}

	// 改写：额外的「控制密钥」绑定/解绑 //

	/** 自身持有的「玩家-密钥」映射表 */
	protected readonly _playerKeyMap: Map<IPlayer, string> = new Map<IPlayer, string>();
	/**
	 * 添加密钥绑定
	 * * 默认使用玩家的自定义名称
	 */
	protected addControlKeyBind(
		player: IPlayer,
		key: string = player.customName
	): void {
		this._playerKeyMap.set(player, key);
	}

	/**
	 * 移除密钥绑定
	 * * 默认使用玩家的自定义名称
	 */
	protected removeControlKeyBind(player: IPlayer): void {
		this._playerKeyMap.delete(player);
	}

	// ! 额外逻辑：增删密钥绑定
	override addSubscriber(subscriber: IPlayer): void {
		// 无参设置绑定
		this.addControlKeyBind(subscriber);
		// 继续超类逻辑
		return super.addSubscriber(subscriber);
	}

	// ! 额外逻辑：增删密钥绑定
	override removeSubscriber(subscriber: IPlayer): boolean {
		// 无参设置绑定
		this.removeControlKeyBind(subscriber);
		// 继续超类逻辑
		return super.removeSubscriber(subscriber);
	}

	/**
	 * 将一个玩家连接到此控制器
	 * 
	 * @param player 要连接到此控制器的玩家
	 * @param controlKey 这个玩家对应的「控制密钥」（默认是玩家的自定义名称）
	 */
	public addConnection(player: IPlayer, controlKey: string = player.customName): void {
		// 无参设置绑定
		this.addControlKeyBind(player, controlKey);
		// 继续超类逻辑
		return super.addSubscriber(player);
	}

	/**
	 * 将一个玩家与此控制器断开连接
	 * 
	 * @param player 要与此控制器断开连接的玩家
	 */
	public removeConnection(player: IPlayer): boolean {
		// 无参设置绑定
		this.removeControlKeyBind(player);
		// 继续超类逻辑
		return super.removeSubscriber(player);
	}

	/**
	 * 根据「控制密钥」分派操作
	 */
	protected dispatchByControlKey(controlKey: string, actionStr: string): void {
		// 解析整数行动
		let a: int | number = parseInt(actionStr);
		let action: int | string = isFinite(a) ? a : actionStr;
		// 开始遍历执行
		for (const player of this.subscribers) {
			if (this._playerKeyMap.get(player) === controlKey) {
				// ! 这是唯一一个添加玩家行为的独有逻辑
				player.onReceive(ADD_ACTION, action);
			}
		}
	}

	// ! 对于「玩家上报的触发」：全空回应
	public onPlayerTick(player: IPlayer, host: IBatrMatrix): void { }
	public reactTick(self: IPlayer, host: IBatrMatrix): PlayerAction { return EnumPlayerAction.NULL }
	public reactHurt(self: IPlayer, host: IBatrMatrix, damage: number, attacker?: IPlayer | undefined): PlayerAction { return EnumPlayerAction.NULL }
	public reactDeath(self: IPlayer, host: IBatrMatrix, damage: number, attacker?: IPlayer | undefined): PlayerAction { return EnumPlayerAction.NULL }
	public reactKillPlayer(self: IPlayer, host: IBatrMatrix, victim: IPlayer, damage: number): PlayerAction { return EnumPlayerAction.NULL }
	public reactPickupBonusBox(self: IPlayer, host: IBatrMatrix, box: BonusBox): PlayerAction { return EnumPlayerAction.NULL }
	public reactRespawn(self: IPlayer, host: IBatrMatrix): PlayerAction { return EnumPlayerAction.NULL }
	public reactMapTransform(self: IPlayer, host: IBatrMatrix): PlayerAction { return EnumPlayerAction.NULL }

}
