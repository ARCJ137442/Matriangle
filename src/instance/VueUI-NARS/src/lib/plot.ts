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
 * 其整体作为一个图表API
 * * 负责调度ECharts包，统一管理界面上用<div>表示的元素图表
 */
export class Plot<X = unknown> {
	// 变量声明
	public x_datas: X[] = []
	public y_datas: YDatas = {}
	protected y_data_series: EChartsSeriesData[]
	protected chart: ECharts

	/** 统一初始化 */
	constructor(
		chartDom: HTMLDivElement,
		/** 存储自身配置&数据 */
		public option: EChartsOption
	) {
		/** 作为后续导入要用到的series，存储其中所有的数据 */
		this.y_data_series = this.option.series as EChartsSeriesData[]

		for (const s of this.y_data_series) {
			// 批量创建数据历史
			this.y_datas[s.name] = []
			// 批量绑定数据引用
			s.data = this.y_datas[s.name]
		}

		this.chart = init(chartDom)

		/** 初始化图表 */
		this.option && this.chart.setOption(this.option)
	}

	/** 数据增删 */
	addData(
		x_data: X,
		y_data: YData,
		shift: boolean = false,
		update: boolean = true
	) {
		// x坐标更新
		this.x_datas.push(x_data)
		// 各个按名称的y坐标更新
		for (const y_data_name in y_data) {
			// 名称在内⇒更新
			if (y_data_name in this.y_datas)
				this.y_datas[y_data_name].push(y_data[y_data_name])
		}
		// 可能的截去开头
		if (shift) {
			this.x_datas.shift()
			for (const y_data_name in this.y_datas)
				this.y_datas[y_data_name].shift()
		}
		// 更新
		if (update) this.update()
	}

	/** 图表更新 */
	update(): void {
		// 决定所更新的
		const toUpdate_series = []
		for (const y_data_config of this.y_data_series) {
			toUpdate_series.push({
				name: y_data_config.name,
				data: y_data_config.data,
			})
		}
		// console.log(toUpdate_series);
		// 显示更新
		this.chart.setOption({
			xAxis: {
				data: this.x_datas,
			},
			series: toUpdate_series,
		})
	}
}
