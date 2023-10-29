<template>
	<Plot ref="plot" @vue:mounted="self.plotInit" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Plot from './Plot.vue'
import plotConfig from './../config/PlotData-NARS.config'
import { VueElementRefNullable } from '../lib/common'

// 子组件 //
const plot: VueElementRefNullable<typeof Plot> = ref(null)

// 方法 //
const self = {
	// 图表初始化
	plotInit(): void {
		plot.value?.init(plotConfig)
	},
	// 图表更新
	update(data: any): void {
		plot.value?.append(data?.x, data)
	},
}
defineExpose(self)
</script>
../config/PlotData-NARS.config
