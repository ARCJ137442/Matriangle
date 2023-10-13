import { uint } from "../../../../legacy/AS3Legacy";
import { MatrixProgram, MatrixProgramLabel } from "../../../api/control/MatrixProgram";
import WebMessageRouter from "../../webIO/WebMessageRouter";
import { NativeWebServiceType } from "../../webIO/WebMessageRouter";

/**
 * 「可视化者」是
 * * 支持HTTP与WebSocket双协议的
 * * 用于传递可视化信号的
 * * 响应式的
 * 母体程序
 */
export default abstract class Visualizer extends MatrixProgram {

	// 构造函数&析构函数 //
	public constructor(
		label: MatrixProgramLabel
	) {
		super(label);
	}

	// 可视化部分 //

	/**
	 * 获取可视化信号
	 * @abstract 抽象方法，需要等子类自行实现
	 */
	public abstract getSignal(message: string): string;

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
		ip: string, port: uint,
	): boolean {
		return router.registerServiceWithType(
			type,
			ip, port,
			this.getSignal.bind(this),
			(): void => {
				console.log(`与路由器成功在${type}://${ip}:${port}建立连接！`);
			}
		);
	}

}
