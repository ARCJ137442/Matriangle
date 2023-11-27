/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// 导入ECharts //
import { ECharts, EChartsOption, init } from 'echarts'

// ECharts的类型标识 //

export type EChartsAxisData = {
	type: string
	boundaryGap: boolean | [number, string]
	data?: unknown[]
}

export type EChartsSeriesData = {
	name: string
	type: string
	smooth: boolean
	symbol: string
	color: string
	data?: unknown[]
}

// 自身用到的类型标识 //
/** 存储自定义的各个数据对象 */
export type YDatas = {
	[name: string]: unknown[]
}
/** 一次更新用到的数据 */
export type YData = {
	[name: string]: unknown
}
/**
 * XY复合数据
 * * 用于通讯：在一次通信中将X、Y数据打包
 * * 固定使用键`x`作为X坐标
 */
export type XYData<X = unknown> = {
	x: X
	[name: string]: unknown
}

/**
 * 识别是否是
 * * 用于通讯：在相同信道数据中识别「数据更新」与「数据初始化」
 * * 核心逻辑：检查是否有「x」键
 */
export function IsXYData<X = unknown>(data: object): data is XYData<X> {
	return 'x' in data
}

/**
 * 其整体作为一个图表API
 * * 负责调度ECharts包，统一管理界面上用<div>表示的元素图表
 */
export class Plot<X = unknown> {
	// 变量声明
	public x_datas: X[] = []
	public y_datas: YDatas = {}
	protected y_data_series: EChartsSeriesData[] = []
	protected chart: ECharts

	/** 统一初始化 */
	constructor(
		chartDom: HTMLDivElement,
		/** 存储自身配置&数据 */
		public option: EChartsOption | null
	) {
		this.chart = init(chartDom)

		/** 初始化图表 */
		this.resetOption(this.option)
	}

	/** 重置配置 */
	resetOption(option: EChartsOption | null): void {
		console.log('重置配置：', option)
		// 空配置⇒返回
		if (option === null) return

		// 覆盖数据
		this.option = option

		// 重置XY数据
		this.x_datas = []
		this.y_datas = {}

		/** 作为后续导入要用到的series，存储其中所有的数据 */
		this.y_data_series = (option.series as EChartsSeriesData[]) ?? [] // !【2023-10-30 23:50:40】现在自动补空

		for (const s of this.y_data_series) {
			// 批量创建数据历史
			this.y_datas[s.name] = []
			// 批量绑定数据引用
			s.data = this.y_datas[s.name]
		}

		this.chart.setOption(option)
	}

	/** 数据增删 */
	addData(
		x_data: X,
		y_data: YData,
		shift: boolean = false,
		update: boolean = true
	): void {
		// 空配置⇒跳过
		if (this.option === null) return
		// x坐标（与末尾）相同⇒合并
		if (
			this.x_datas.length > 0 &&
			this.x_datas[this.x_datas.length - 1] == x_data
		) {
			// ! 假定：x、y都不可能是空数组
			// 各个按名称的y坐标更新
			for (const y_data_name in y_data) {
				// 有数组记录⇒末位赋值/构建
				if (y_data_name in this.y_datas)
					if (this.y_datas[y_data_name].length < this.x_datas.length)
						// 落后于x坐标数目⇒追加
						this.y_datas[y_data_name].push(y_data[y_data_name])
					// 否则（等于|多于）⇒末位替换
					else
						this.y_datas[y_data_name][
							this.y_datas[y_data_name].length - 1
						] = y_data[y_data_name]
				// 无数组记录⇒末位追加（创建）
				else this.y_datas[y_data_name] = [y_data[y_data_name]]
			}
			// 此时不会截去开头：X坐标数目并未增多
		}
		// x坐标不同⇒追加
		else {
			this.x_datas.push(x_data)
			// 各个按名称的y坐标更新
			for (const y_data_name in y_data) {
				// 名称在内⇒更新
				if (y_data_name in this.y_datas)
					this.y_datas[y_data_name].push(y_data[y_data_name])
				// 不在内⇒新建
				else this.y_datas[y_data_name] = [y_data[y_data_name]]
			}
			// 可能的截去开头
			if (shift) {
				this.x_datas.shift()
				for (const y_data_name in this.y_datas)
					this.y_datas[y_data_name].shift()
			}
		}
		// 更新
		if (update) this.update()
	}

	/** 图表更新 */
	update(): void {
		// 空配置⇒跳过
		if (this.option === null) return
		if (!Array.isArray(this.y_data_series)) {
			console.error(
				'图表更新失败：y_data_series必须是数组',
				this.y_data_series
			)
			return
		}
		// 决定所更新的
		const toUpdate_series = []
		for (const y_data_config of this.y_data_series) {
			toUpdate_series.push({
				name: y_data_config.name,
				data: y_data_config.data,
			})
		}
		// 显示更新
		this.chart.setOption({
			xAxis: {
				data: this.x_datas,
			},
			series: toUpdate_series,
		})
	}

	/**
	 * 图表导出：XSV
	 *
	 * ! 未加入「预先转义」功能
	 */
	public toXSV(
		columnSeparator: string,
		rowSeparator: string,
		columnName: boolean = true,
		rowIndex: boolean = true
	): string {
		const order = Object.keys(this.y_datas)
		// eslint-disable-next-line prefer-rest-params
		console.log('arguments', arguments)

		let result =
			// 列名/行索引
			(rowIndex ? columnSeparator : '') +
			(columnName ? order.join(columnSeparator) + rowSeparator : '')
		// 长度上逐行遍历
		for (let row = 0; row < this.x_datas.length; row++) {
			// 行索引
			if (rowIndex) result += String(row) + columnSeparator
			// 宽度上逐列遍历
			for (let col = 0; col < order.length; col++) {
				// 分隔符
				if (col > 0) result += columnSeparator
				result += String(this.y_datas[order[col]][row])
			}
			result += rowSeparator
		}
		// 返回
		return result
	}

	/**
	 * 特化：TSV
	 *
	 * ! 未加入「预先转义」功能
	 */
	public toTSV(columnName: boolean = true, rowIndex: boolean = true): string {
		return this.toXSV('\t', '\n', columnName, rowIndex)
	}
}
