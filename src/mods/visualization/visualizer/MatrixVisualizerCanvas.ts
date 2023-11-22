import IMatrix from 'matriangle-api/server/main/IMatrix'
import { entityLV实体列表可视化 } from '../logic/textVisualizations'
import { MatrixProgramLabel } from 'matriangle-api/server/control/MatrixProgram'
import MatrixVisualizer from './MatrixVisualizer'
import {
	NativeVisualizationTypeFlag,
	VisualizationOutputMessagePrefix,
	packDisplayData,
} from 'matriangle-api/display/RemoteDisplayAPI'
import { typeID } from 'matriangle-api'
import MatrixVisualizerText from './MatrixVisualizerText'
import {
	JSObjectValue,
	JSObjectValueWithUndefined,
	copyJSObjectValue_deep,
	diffJSObjectValue,
	mergeJSObjectValue,
	removeUndefinedInJSObjectValueWithUndefined,
} from 'matriangle-common/JSObjectify'
import { uint } from 'matriangle-legacy'
import { getAddress } from 'matriangle-mod-message-io-api'

/**
 * 「文本母体可视化者」是
 * * 用于传递母体的可视化信号的
 * * 以「canvas指令」形式传递母体信号的
 * 可视化者
 */
export default class MatrixVisualizerCanvas extends MatrixVisualizer {
	/** ID */
	public static readonly ID: typeID = 'MatrixVisualizerCanvas'
	/** 标签 */
	public static readonly LABEL: MatrixProgramLabel =
		'Visualizer:Matrix@canvas'

	/**
	 * TODO: 基于先前「diff-merge」算法的基础，实现「一个可视化者，一个『母体显示数据』」
	 * * 最终目标：让一个「Canvas可视化者」同时支持多个「Canvas客户端」
	 * * 实现路径：特异于地址的「母体显示diff-merge」机制
	 *   * 分地址维护一个「基准显示数据」
	 *     * 从母体侧获取（未脱引用的）「母体显示数据」，复制后作为「基准显示数据」存入
	 *     * 📌「母体显示数据」的特点：
	 *       * 通常由「母体」「方块」「地图」「实体」各自的「显示代理」维护，引用由显示代理唯一持有
	 *       * 随着母体运作而动态更新：母体、方块、地图、实体直接通过其「显示代理」更新数据，而不直接访问可视化者
	 *       * 引用持有结构：母体（地图（方块），实体系统（实体））
	 *       * 引用纠缠频繁：直接复制引用后，很可能会因「后续修改」导致「diff失真」
	 *   * 当从该地址接收到一个「初始化」信号时
	 *     * 将「母体显示数据」直接传输
	 *     * 将「母体显示数据」录入「基准显示数据中」
	 *   * 当从该地址接收到一个「更新」信号时
	 *     * 将「母体显示数据」和「基准显示数据」进行diff
	 *     * JSON化并传输diff对象
	 *       * 显示端将直接通过「diff」来更新数据
	 *     * 将diff对象merge入「基准显示数据」
	 *     * 这本来不是「显示端」能控制的
	 */

	// 构造函数&析构函数 //
	public constructor(
		/**
		 * 保存自身与母体的链接
		 */
		public linkedMatrix: IMatrix | null = null
	) {
		super(MatrixVisualizerCanvas.ID, MatrixVisualizerCanvas.LABEL)
	}

	// 母体可视化部分 //

	/**
	 * 根据「类型标签」获取母体的可视化信号
	 *
	 * @returns {[string,string] | undefined} [可视化信号类型, 可视化信号] or 无需回传
	 */
	public getVisionSignalMatrix(
		matrix: IMatrix,
		typeFlag: string,
		sourceHost: string,
		sourcePort: uint
	): [VisualizationOutputMessagePrefix, string] | undefined {
		switch (typeFlag) {
			case NativeVisualizationTypeFlag.OTHER_INFORMATION:
				// （保留）以纯文本方式返回「实体列表」
				return [
					VisualizationOutputMessagePrefix.OTHER_INFORMATION,
					entityLV实体列表可视化(matrix.entities),
				]
			// * 全新的「显示数据传递」 // 【2023-11-22 17:18:35】现在交给专门的函数去实现
			case NativeVisualizationTypeFlag.INIT:
				// 返回
				return [
					VisualizationOutputMessagePrefix.CANVAS_DATA_INIT,
					// * 统一管理「JSON化」与「消息回复」的过程
					JSON.stringify(
						this.reactSignalRequest_init(
							matrix,
							sourceHost,
							sourcePort
						)
					),
				]
			case NativeVisualizationTypeFlag.REFRESH: {
				const diff2refresh: JSObjectValue | undefined =
					this.reactSignalRequest_refresh(
						matrix,
						sourceHost,
						sourcePort
					)
				return diff2refresh === undefined
					? undefined
					: [
							VisualizationOutputMessagePrefix.CANVAS_DATA_REFRESH,
							// * 统一管理「JSON化」与「消息回复」的过程
							JSON.stringify(diff2refresh),
					  ]
			}
			default:
				console.warn(
					`[${MatrixVisualizerCanvas.ID}] 未知的可视化类型「${typeFlag}」，已自动fallback到「文本可视化」中`
				)
				// 调用「文本母体可视化者」的「获取可视化信号」
				return MatrixVisualizerText.getVisionSignal(
					matrix,
					MatrixVisualizerText.parseTypeFlag(typeFlag)
				)
		}
	}

	// * 全新的「显示信号缓存」系统 * //

	/**
	 * 显示信号缓存：「基准显示数据集」
	 * * 这里边的「基准显示数据」在引用上与母体**完全不互通**
	 * * 🎯让一个可视化者支持多个「Canvas客户端」
	 * * 特异于地址：分不同的地址进行存储，作为地址的映射字典
	 */
	protected readonly _baseDisplayDatas: {
		[address: string]: JSObjectValue
	} = {}

	/**
	 * 从母体侧获取（未脱引用的）「母体显示数据」，复制后作为「基准显示数据」存入
	 * * 📌「母体显示数据」的特点：
	 *   * 通常由「母体」「方块」「地图」「实体」各自的「显示代理」维护，引用由显示代理唯一持有
	 *   * 随着母体运作而动态更新：母体、方块、地图、实体直接通过其「显示代理」更新数据，而不直接访问可视化者
	 *   * 引用持有结构：母体（地图（方块），实体系统（实体））
	 *   * 引用纠缠频繁：直接复制引用后，很可能会因「后续修改」导致「diff失真」
	 * * 📌「基准显示数据」的特点：
	 *   * 引用完全脱钩：其内任意对象（的引用）都只被所属的「可视化者」持有
	 *   * 更新脱敏：由于「引用完全脱钩」，其内对象的值不会随着母体运作而「量子纠缠式更新」
	 *
	 * @param matrix 需要录入「母体显示数据」的母体
	 * @param address 对应客户端的地址
	 * @returns 存入的「基准显示数据」
	 */
	protected saveMatrixDisplayDataAsBase(
		matrix: IMatrix,
		address: string
	): JSObjectValue {
		this._baseDisplayDatas[address] = copyJSObjectValue_deep(
			// ! 这里假定 matrix.getDisplayData() 一定为 JSObjectValue
			matrix.getDisplayData() as unknown as JSObjectValue
		)
		return this._baseDisplayDatas[address]
	}

	/**
	 * 判断指定地址是否已有「基准显示数据」
	 */
	protected hasBaseDisplayData(address: string): boolean {
		return address in this._baseDisplayDatas
	}

	/**
	 * 获取指定地址的「基准显示数据」
	 * * 无⇒返回undefined
	 */
	protected getBaseDisplayData(address: string): JSObjectValue | undefined {
		return this._baseDisplayDatas?.[address]
	}

	/**
	 * 响应「信号初始化请求」
	 * * 当从该地址接收到一个「初始化」信号时
	 *     * 将「母体显示数据」录入「基准显示数据」中，进行预处理
	 *       * 如「去除其中的空对象」「删除`undefined`」等
	 *     * 将「基准显示数据」直接JSON化并传输
	 */
	protected reactSignalRequest_init(
		matrix: IMatrix,
		host: string,
		port: uint // ?【2023-11-22 21:44:12】这里似乎在「同客户端多主机」的情况下不好用……
	): JSObjectValue {
		// 录入「母体显示数据」为「基准显示数据」
		return this.saveMatrixDisplayDataAsBase(matrix, getAddress(host, port))
	}

	/**
	 * 响应「信号刷新」请求
	 * * 指定有其它的矩阵，确保是从{@link this.linkedMatrix}中传入的
	 *   * 这样不用检测是否为null
	 * * 当从该地址接收到一个「更新」信号时
	 *   * 将「母体显示数据」和「基准显示数据」进行diff
	 *   * JSON化并传输diff对象
	 *     * 显示端将直接通过「diff」来更新数据
	 *     * 会抛掉其中的`undefined`
	 *   * 将diff对象merge入「基准显示数据」
	 *
	 * @param matrix 所要更新的母体
	 * @param host 信号来源的主机地址
	 * @param host 信号来源的服务端口
	 * @returns 需要更新的JS对象，或者`undefined`代表「无需更新」
	 */
	protected reactSignalRequest_refresh(
		matrix: IMatrix,
		host: string,
		port: uint // ?【2023-11-22 21:46:12】问题来了：这里的服务是「可视化者所在的服务」，并不能区分「同一地址下的不同连接」 // 其中一个思路是：使用「首次连接时的时间戳`Number(new Date())`」进行区分
	): JSObjectValue | undefined {
		/** 获取地址 */
		const address: string = getAddress(host, port)
		// * 预先判断「是否缓存有『基准显示数据』」
		if (this.hasBaseDisplayData(address)) {
			const base: JSObjectValue = this.getBaseDisplayData(address)!
			// * 数据diff：自身「基准显示数据」 - 目标「母体显示数据」
			const diff: JSObjectValueWithUndefined = diffJSObjectValue(
				// * 这里的「基准」就是「基准」
				base,
				// !【2023-11-22 18:14:42】目前假定「母体显示数据」也是JS对象，并且可以直接用来diff（而无需再检查undefined之类的）
				matrix.getDisplayData() as unknown as JSObjectValue
			)
			// * 先merge（因为后续「移除`undefined」时会修改到diff）
			mergeJSObjectValue(base, diff)
			// * 返回需要传输的diff
			// !【2023-11-22 18:24:42】需要检查并移除`undefined`，因为后续JSON.stringify会丢失这方面的信息
			return diff === undefined
				? // 无变化⇒不传输
				  undefined
				: // 移除其中的undefined
				  removeUndefinedInJSObjectValueWithUndefined(
						diff,
						// ! 严格处理，必要时发出警告
						undefined,
						true
				  )
		}
		// * 无⇒当「初始化」处理
		else {
			return this.reactSignalRequest_init(matrix, host, port)
		}
	}
	protected _temp_reactSignalRequest_refresh_data: JSObjectValue = null

	/** @implements 实现：根据不同的消息来源，进行不同的回应 */
	getSignal(message: string, host: string, port: uint): string | undefined {
		if (this.linkedMatrix === null) return undefined
		const signal: [VisualizationOutputMessagePrefix, string] | undefined =
			this.getVisionSignalMatrix(this.linkedMatrix, message, host, port)
		return signal === undefined
			? undefined
			: // * 链接到了母体⇒打包从母体获得/缓存的「显示数据」
			  packDisplayData(...signal)
	}
}
