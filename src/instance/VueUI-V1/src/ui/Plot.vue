<template>
	<div ref="eChart" class="plot"></div>
</template>

<script setup lang="ts">
import { ref, Ref } from 'vue'
import { Plot, XYData } from '../lib/plot'
import { EChartsOption } from 'echarts'

/** echarts电子表格对象 */
const eChart: Ref<HTMLDivElement | null> = ref<HTMLDivElement | null>(null)

/** 基于外部库封装的Plot对象 */
let plot: Plot | undefined = undefined

// 暴露属性&方法
defineExpose({
	/** 初始化数据 */
	init(options: EChartsOption | null): void {
		if (eChart.value === null)
			return console.error('指定的元素eChart为空！')
		plot = new Plot(eChart.value, options)
		console.log('图表加载成功！', plot)
	},
	/** 判断数据是否已初始化 */
	isInited(): boolean {
		return plot !== undefined && plot.option !== null
	},
	/** 重置配置 */
	reset(option: EChartsOption): void {
		if (plot === undefined) return console.error('图表未初始化!')
		plot.resetOption(option)
	},
	/** 添加数据 */
	append(xy_data: XYData): void {
		plot?.addData(xy_data.x, xy_data)
	},
	/** 导出TSV数据 */
	exportTSV(): string | null {
		return plot?.toTSV() ?? null
	},
})
</script>

<style scoped>
/* 图表 */
.plot {
	width: 100%;
	height: 400px;
}
</style>
