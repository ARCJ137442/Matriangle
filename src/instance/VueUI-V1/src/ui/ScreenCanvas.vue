<!-- 用于旧有「纯文本显示」的功能 -->
<template>
	<!-- 画板屏显 -->
	<canvas ref="canvas" id="canvas"></canvas>
	<!-- 文本屏显 -->
	<p class="screenText" v-show="screenText.length > 0">{{ screenText }}</p>
	<!-- 附加信息 -->
	<p class="otherInfText" v-show="otherInfText.length > 0">
		{{ otherInfText }}
	</p>
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
import { VisualizationOutputMessagePrefix } from 'matriangle-mod-visualization/logic/abstractVisualization.type'

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

// 变量引用
/** 屏显canvas */
const canvas: Ref<HTMLCanvasElement | null> = ref(null)
/** 「文本屏显」文本 */
const screenText: Ref<string> = ref('') // ! 默认关
/** 「附加信息」文本 */
const otherInfText: Ref<string> = ref('附加信息：无信号。。。')

// 注册方法
defineExpose({
	/**
	 * 根据数据更新
	 *
	 * @param {[VisualizationOutputMessagePrefix, string] | null} data 数据
	 */
	update(data: [VisualizationOutputMessagePrefix, string] | null): void {
		if (data === null) return
		// 非空
		switch (data[0]) {
			// * 附加信息
			case VisualizationOutputMessagePrefix.OTHER_INFORMATION:
				otherInfText.value = data[1]
				break
			// * 画板
			case VisualizationOutputMessagePrefix.CANVAS_DATA:
				if (canvas.value === null)
					console.warn('Canvas屏幕：未找到canvas！')
				else if (frame === null)
					console.warn('Canvas屏幕：未找到frame！')
				else canvasVisualize(frame, /* canvas.value, */ data[1])
				break
			// * 文本……也支持
			case VisualizationOutputMessagePrefix.TEXT:
				screenText.value = data[1]
				break
			// * 其它
			default:
				console.warn('未知的消息类型！', data)
		}
	},
})
</script>

<style scoped>
/* 文本屏显 */
.screenText {
	/* 保留空格 */
	white-space: pre;
	/* 等宽字体 */
	font-family: Consolas, Monaco, 'Courier New', monospace;
	font-size: smaller;
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
