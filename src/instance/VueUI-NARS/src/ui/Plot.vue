<template>
	<div ref="eChart" class="plot"></div>
</template>

<script setup lang="ts">
import { ref, Ref } from 'vue'
import { Plot, YData } from '../lib/plot'
import { EChartsOption } from 'echarts'
const eChart: Ref<HTMLDivElement | null> = ref<HTMLDivElement | null>(null)

// 初始化
function init(options: EChartsOption): void {
	if (eChart.value === null) {
		console.error('指定的元素eChart为空！')
		return
	}
	plot = new Plot(eChart.value, options)
	console.log('图表加载成功！', plot)
}
let plot: Plot | undefined = undefined

// 暴露属性&方法
defineExpose({
	init,
	append(x_data: unknown, y_data: YData): void {
		plot?.addData(x_data, y_data)
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
