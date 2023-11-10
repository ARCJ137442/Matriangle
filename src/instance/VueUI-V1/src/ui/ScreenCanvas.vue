<!-- 用于旧有「纯文本显示」的功能 -->
<template>
	<!-- 文本屏显 -->
	<canvas ref="canvas" class="canvas"></canvas>
	<!-- 附加信息 -->
	<p class="otherInfText">{{ otherInfText }}</p>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue'
import { canvasVisualize_V1 as canvasVisualize } from '../lib/canvasVisualizeBrowser'

// 类型定义
type CanvasDisplayData = {
	screen?: string
	otherInf?: string
}

// 变量引用
/** 屏显canvas */
const canvas: Ref<HTMLCanvasElement | null> = ref(null)
/** 「附加信息」文本 */
const otherInfText: Ref<string> = ref('附加信息：无信号。。。')

// 注册方法
defineExpose({
	/**
	 * 根据数据更新
	 *
	 * @param data 数据
	 */
	update(data: CanvasDisplayData): void {
		if (data?.screen !== undefined)
			if (canvas.value === null)
				console.warn('Canvas屏幕：未找到canvas！')
			else canvasVisualize(canvas.value, data.screen)
		if (data?.otherInf !== undefined) otherInfText.value = data.otherInf
	},
})
</script>

<style scoped>
/* 屏显 */
.canvas {
	/* 默认尺寸 */
	width: 500px;
	height: 440px;
}

/* 附加信息 */
.otherInfText {
	/* 保留空格 */
	white-space: pre;
	/* 字体 */
	font-family: Consolas, Monaco, 'Courier New', monospace;
	font-size: medium;
	font-weight: inherit;
}
</style>
