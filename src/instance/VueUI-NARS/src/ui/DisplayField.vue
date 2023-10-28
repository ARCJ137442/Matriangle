<!-- 用于整个「显示区」，其中的「屏幕」变为可替换的子组件 -->
<template>
	<!-- * 屏幕：纯文本 * -->
	<h2>显示区</h2>
	<input type="text" v-model="screenAddress" placeholder="输入链接" />
	<input type="text" v-model="screenFPS" placeholder="输入FPS" />
	<input
		type="text"
		v-model="displayCode"
		placeholder="输入显示码(6 | player6@P2)"
	/>
	<ScreenText ref="screen" />
</template>

<script setup lang="ts">
// 导入子组件 //
import { Ref, ref } from 'vue'
import ScreenText from './ScreenText.vue'
import { VueElementRefNullable } from '../lib/common'

// 屏显 //
const screen: VueElementRefNullable<typeof ScreenText> = ref(null)

// 控制参数 //
const screenAddress: Ref<string> = ref('127.0.0.1:8080')
const screenFPS: Ref<string> = ref('10')
const displayCode: Ref<string> = ref('6')
const HEART_BEAT_INTERVAL = 1000
// let screenIntervalID: any // 没法确认到底是Timeout、number还是其它什么类型

// 事件 //
/**
 * 更新连接
 * * 发送「连接」事件，请求更新连接：
 *   * 无连接⇒新建
 *   * 有连接⇒不做动作
 * * 事件参数：
 *   * 连接地址
 */
function updateConnection(): void {
	emit('link', screenAddress.value)
}

const emit = defineEmits(['link', 'refresh'])
defineExpose({
	updateConnection,
	/**
	 * 更新（文本）屏显
	 */
	updateDisplayScreen(data: { [key: string]: unknown }): void {
		if (screen.value !== null) screen.value.update(data)
		else console.warn('屏显对象不存在！')
	},
	/**
	 * 获取刷新速率（整数）
	 */
	getFPS: (): number => 1000 / parseFloat(screenFPS.value),
})

// 心跳更新 //
setInterval((): void => {
	updateConnection()
	onFPSRefresh(parseFloat(screenFPS.value))
}, HEART_BEAT_INTERVAL)

// 屏显刷新：主动 by FPS //
function getMSfromFPS(fps: number): number {
	return 1000 / fps
}

/** 不管其类型，只要调用合法 */
let FPSRefreshIntervalID: any = undefined
/** 发送「附加信息」用的消息 */
const otherInfMessage: string = 'entities'
/** 当FPS刷新时 */
function onFPSRefresh(newFPS: number): void {
	// 原有⇒尝试清除
	if (FPSRefreshIntervalID !== undefined) {
		// FPS相等⇒不必费周折
		if (newFPS === parseFloat(screenFPS.value)) return
		clearInterval(FPSRefreshIntervalID)
	}
	// 更新
	FPSRefreshIntervalID = setInterval((): void => {
		// 先发一次「屏显更新」
		emit('refresh', screenAddress.value, displayCode.value)
		// 再发一次「附加信息更新」
		emit('refresh', screenAddress.value, otherInfMessage)
	}, getMSfromFPS(newFPS))
}
</script>

<style scoped>
/* 输入框样式 */
input[type='text'] {
	/* 输入框宽度 */
	width: 10%;
	min-width: 100px;
	/* 输入框高度 */
	height: 5%;
	min-height: 20px;
	/* 字体 */
	font-family: Arial, Helvetica, sans-serif;
	/* 字体大小 */
	font-size: 14px;
	/* 内边距 */
	padding: 5px;
	/* 边框样式 */
	border: 5px solid #ccc;
	/* 边框圆角 */
	border-radius: 4px;
}

/* 输入框的placeholder样式 */
input[type='text']::placeholder {
	color: #999;
	/* 文字颜色 */
}
</style>
