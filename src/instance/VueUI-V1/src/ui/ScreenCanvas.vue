<!-- 用于旧有「纯文本显示」的功能 -->
<template>
	<!-- 文本屏显 -->
	<canvas ref="canvas" id="zim"></canvas>
	<!-- 附加信息 -->
	<p class="otherInfText">{{ otherInfText }}</p>
</template>

<script setup lang="ts">
// Matriangle API
import { DISPLAY_SIZE } from 'matriangle-api/display/GlobalDisplayVariables'
import {
	canvasVisualize_V1 as canvasVisualize,
	test_draw,
} from '../lib/canvasVisualizeBrowser'
// Vue
import { Ref, ref, onMounted, onBeforeUnmount } from 'vue'
// 外部库
import { Frame, Circle, Rectangle } from 'zimjs'
import Zim from 'zimjs'
import { randInt } from 'matriangle-common/exMath'
import { formatRGBA } from '../../../../common'

let frame: Frame
let r: Rectangle

/**
 * 加载时初始化
 * 参考自<https://github.com/yoanhg421/zimjs-templates/blob/master/templates/vue-zim-ts/src/App.vue>
 */
onMounted((): void => {
	// 加载帧
	frame = new Frame({
		// 链接的元素id
		scaling: 'zim',
		// 宽高
		width: DISPLAY_SIZE,
		height: DISPLAY_SIZE,
		// 背景颜色 跟随BaTr
		color: '#ddd',
		// 初始化
		ready: (): void => {
			// 添加一个圆
			new Circle(50, formatRGBA(255, 0, 0, 0.5)) //半径50，半透明红色
				// 放到屏幕中央
				.center()
				// 可拖动
				.drag()
			// 添加一个随机正方形
			const a = randInt(50) + 10
			r = new Rectangle({
				width: a,
				height: a,
				color: '#' + randInt(0xffffff).toString(16),
			})
				// 随机一个位置
				.pos(Math.random() * frame.width, Math.random() * frame.height)
				// 可拖动
				.drag()
			// 添加测试用新形状
			test_draw(() => new Zim.Shape())
			// 更新场景
			frame.stage.update()
		},
	})
})

setInterval((): void => {
	/* // 添加一个圆
	new Circle(10 + randInt(40), '#' + randInt(0xffffff).toString(16))
		// 随机一个位置
		.pos(Math.random() * frame.width, Math.random() * frame.height)
		// 可拖动
		.drag() */

	// 随机一个位置
	r.pos(Math.random() * frame.width, Math.random() * frame.height).rot(
		Math.random() * 360
	)
	r.width = r.height = 10 + randInt(40)
	// 更新场景
	frame?.stage?.update()
}, 1000)

// 在卸载时释放资源
onBeforeUnmount((): void => {
	// 尝试释放资源
	frame?.dispose?.()
})

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
