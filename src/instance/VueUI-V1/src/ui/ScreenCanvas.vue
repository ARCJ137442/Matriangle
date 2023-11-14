<!-- 用于旧有「纯文本显示」的功能 -->
<template>
	<!-- 文本屏显 -->
	<canvas ref="canvas" id="canvas"></canvas>
	<!-- 附加信息 -->
	<p class="otherInfText">{{ otherInfText }}</p>
</template>

<script setup lang="ts">
// Matriangle API
import { DISPLAY_SIZE } from 'matriangle-api/display/GlobalDisplayVariables'
import { canvasVisualize_V1 as canvasVisualize } from '../lib/canvasVisualizeBrowser'
// Vue
import { Ref, ref, onMounted, onBeforeUnmount } from 'vue'
// 外部库
import { Frame, Shape } from 'zimjs'
import Zim from 'zimjs'
import {
	test_draw,
	test_mapDisplayer,
} from '../lib/zim/DisplayImplementsClient_Zim'

let frame: Frame
let shapes: Shape[]

/**
 * 加载时初始化
 * 参考自<https://github.com/yoanhg421/zimjs-templates/blob/master/templates/vue-zim-ts/src/App.vue>
 * TODO: 尚处测试阶段
 */
onMounted((): void => {
	// 加载帧
	frame = new Frame({
		// 链接的元素id
		scaling: 'canvas',
		// 宽高
		width: DISPLAY_SIZE,
		height: DISPLAY_SIZE,
		// 背景颜色 跟随BaTr
		color: '#ddd',
		// 初始化
		ready: (): void => {
			// 添加测试用新形状
			shapes = test_draw((): Shape => new Zim.Shape())
			// 添加测试用地图呈现者
			const mapDisplayer = test_mapDisplayer(frame)
			// 调整尺寸 // ! 尺寸调不了，frame.remakeCanvas报错用不了
			const aSize = mapDisplayer.unfoldedDisplaySize2D

			// frame.remakeCanvas(aSize[0] * 0.32, aSize[1] * 0.32)
			updateCanvasSize(aSize[0] * 0.32, aSize[1] * 0.32)
			// 重定位
			mapDisplayer.relocateInFrame(frame.stage).drag()
			// 更新场景
			frame.stage.update()
		},
	})
})

setInterval((): void => {
	// 遍历每个生成的图形
	shapes.forEach((shape: Shape): void => {
		if (shape === null || shape === undefined) return
		/* // 添加一个圆
	new Circle(10 + randInt(40), '#' + randInt(0xffffff).toString(16))
		// 随机一个位置
		.pos(Math.random() * frame.width, Math.random() * frame.height)
		// 可拖动
		.drag() */

		// 随机一个位置
		shape
			.pos(Math.random() * frame.width, Math.random() * frame.height)
			.rot(Math.random() * 360)
		// shape.width = shape.height = 10 + randInt(40)
		shape.scaleX = shape.scaleY = 0.5 + Math.random()
		// 更新场景
		frame?.stage?.update()
	})
}, 4000)

// 在卸载时释放资源
onBeforeUnmount((): void => {
	// 尝试释放资源
	frame?.dispose?.()
})

/**
 * 更新画布尺寸
 */
function updateCanvasSize(W: number, H: number): void {
	if (!canvas.value) {
		console.error('未找到画板元素！')
		return
	}
	canvas.value.width = W
	canvas.value.height = H
	console.log('画板尺寸更新：', [W, H])
}

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
../lib/zim/DisplayImplementsClient_Zim
