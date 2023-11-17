<!-- 用于整个「显示区」，其中的「屏幕」变为可替换的子组件 -->
<template>
	<!-- * 屏幕：纯文本 * -->
	<h2>显示区（{{ messageServiceConnectedText }}）</h2>
	<div>
		<input
			type="text"
			v-model="displayAddress"
			placeholder="输入连接地址"
			@keydown="
				(e: KeyboardEvent): false | void =>
					e.key === 'Enter' && onAddressChange()
			"
		/>
		<input
			type="text"
			v-model="screenFPS"
			placeholder="输入FPS"
			@keydown="onUpdateFPS"
		/>
		<input
			type="text"
			v-model="displayCode"
			placeholder="输入显示码(6 | player6@P2)"
		/>
	</div>
	<ScreenCanvas ref="screen" @vue:mounted="requestAliveLink" />
	<!-- <ScreenText ref="screen" @vue:mounted="requestAliveLink" /> -->
</template>

<script setup lang="ts">
// 导入子组件 //
import { Ref, ref } from 'vue'
import { default as Screen } from './ScreenCanvas.vue'
import ScreenCanvas from './ScreenCanvas.vue' // 需要被template引用
// import { default as Screen } from './ScreenText.vue'
// import ScreenText from './ScreenText.vue' // 需要被template引用
import { VueElementRefNullable } from '../lib/common'

// 屏显 //
const screen: VueElementRefNullable<typeof Screen> = ref(null)

// 控制参数 //
const displayAddress: Ref<string> = ref('127.0.0.1:8080')
let _lastAddress: string = displayAddress.value
const screenFPS: Ref<string> = ref('10')
const displayCode: Ref<string> = ref('6')
const HEART_BEAT_INTERVAL = 2000 // ! 太快的连接会导致频繁重连，发生连不上的情况
// let screenIntervalID: any // 没法确认到底是Timeout、number还是其它什么类型

/** 持续连接建立（只需一次） */
function requestAliveLink(): void {
	emit(
		'link-start',
		/* 参数格式：
			address: string,
			heartbeatTimeMS: number,
			callbackMessage: MessageCallback,
			callbackConnected?: voidF,
			callbackStop?: voidF
			*/
		displayAddress.value,
		HEART_BEAT_INTERVAL,
		/** 消息回调函数 */
		(message: string): undefined => {
			// console.log('displayMessageCallback_text: 收到消息', message)
			// 若为「实体列表」⇒更新「附加信息」
			if (message.startsWith('实体列表'))
				self.updateDisplayScreen({
					// screen:
					otherInf: message,
				})
			// 否则⇒更新「屏显」
			else
				self.updateDisplayScreen({
					screen: message,
				})
			return undefined
		},
		/** 当屏显连接开启时 */
		(): void => {
			// 更新状态
			messageServiceConnectedText.value = '已连接'
			// 开始屏显消息请求
			onFPSRefresh(parseFloat(screenFPS.value))
		},
		/** 当屏显连接终止时 */
		(): void => {
			// 更新状态
			messageServiceConnectedText.value = '断线'
			// 已清除⇒作罢
			if (FPSRefreshIntervalID === undefined) return
			// 否则清除时钟
			else FPSRefreshIntervalID = clearInterval(FPSRefreshIntervalID)
		}
	)
}

/**
 * 地址变更事件
 * * 格式：(旧地址：string, 新地址：string)
 */
function onAddressChange(): void {
	emit(
		'link-change',
		// 旧地址
		_lastAddress,
		// 新地址
		displayAddress.value
	)
	// 更新旧地址
	_lastAddress = displayAddress.value
}
/** 屏显刷新：主动 by FPS */
const getMSfromFPS = (fps: number): number => 1000 / fps

/** 不管其类型，只要调用合法 */
let FPSRefreshIntervalID: any = undefined
/** 发送「附加信息」用的消息 */
const otherInfMessage: string = 'other-information'
/** 当通过文本框更新FPS时 */
function onUpdateFPS(e: KeyboardEvent): void {
	if (e.key === 'Enter') onFPSRefresh(parseFloat(screenFPS.value))
}
/**
 * 当FPS刷新时：处理周期
 *
 * !【2023-10-29 21:02:00】这里的「刷新」机制是没问题的，出问题的是屏显不响应
 * *【2023-10-29 21:08:22】溯源结果：
 */
function onFPSRefresh(newFPS: number): void {
	// 原有⇒尝试清除（没必要和文本框中的做比较）
	if (FPSRefreshIntervalID !== undefined) clearInterval(FPSRefreshIntervalID)
	// 更新
	FPSRefreshIntervalID = setInterval((): void => {
		// 先发一次「屏显更新」
		emit('refresh', displayAddress.value, displayCode.value)
		// 再发一次「附加信息更新」
		emit('refresh', displayAddress.value, otherInfMessage)
	}, getMSfromFPS(newFPS))

	console.log(`FPS已更新: ${newFPS} | ${getMSfromFPS(newFPS)}ms`)
}

// 状态参数
const messageServiceConnectedText: Ref<string> = ref('未连接')

// 外部方法 //
const emit = defineEmits(['link-start', 'link-change', 'refresh'])
const self = {
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
}
defineExpose(self)
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
