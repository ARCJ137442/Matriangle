<template>
	<MessageRouter ref="router" />

	<h1>控制</h1>
	<ControlPanel ref="panel" @message="pack => sendMessagePack(pack)" />

	<h1>显示</h1>
	<DisplayField
		ref="display"
		@link="handleDisplayLinkRequest"
		@refresh="handleDisplayRefreshRequest"
	/>

	<h1>图表</h1>
	<Plot ref="plot" @vue:mounted="plotInit" />
</template>

<script setup lang="ts">
/**
 * ! 负责处理网络联系，沟通各个子组件
 * * 如：
 *   * 从「控制面板」获得控制信息，把键控消息传递给Websocket连接
 *   * 从Websocket连接中获取消息，传递给「屏幕」和「图表」
 */
import { ref } from 'vue'
import { VueElementRefNullable, splitAddress } from '../lib/common'
import { WebSocketServiceClient } from 'matriangle-mod-message-io-browser/services'

/// 导入子组件 ///
// import './app.css' // 导入CSS作为样式 // !【2023-10-29 01:20:49】现弃用
// import Chart from './Chart.vue'
import { omega1 } from './../lib/common'
import ControlPanel from './ControlPanel.vue'
// import ScreenText from './ScreenText.vue'
import MessageRouter from './MessageRouter.vue'
import Plot from './Plot.vue'
import plotConfig from './../config/PlotData.config'
import {
	IMessageService,
	MessageCallback,
} from 'matriangle-mod-message-io-api/MessageInterfaces'
import DisplayField from './DisplayField.vue'

/// 开始 ///

// 全局侦听器 //
window.addEventListener('keydown', (e: KeyboardEvent): void =>
	onKeyEvent(e, true)
)
window.addEventListener('keyup', (e: KeyboardEvent): void =>
	onKeyEvent(e, false)
)

// 消息路由器 //
type MessagePack = { address: string; message: string }
const router: VueElementRefNullable<typeof MessageRouter> = ref(null)
/* setInterval((): void => {
	console.log(router.value?.router)
}, 1000) */ // 【2023-10-29 00:52:30】测试成功
/**
 * 向路由器输送消息
 * * 附带「自动重连」功能
 */
function sendMessagePack(
	pack: MessagePack,
	messageCallback: MessageCallback = omega1<string>
): void {
	if (router.value !== null)
		if (pack.address === undefined || pack.message === undefined)
			console.error('消息包无效！', pack)
		else if (router.value.send(pack.address, pack.message)) void 0
		else if (!router.value.hasService(pack.address)) {
			console.warn(`服务「${pack.address}」不存在！`)
			console.info('正在尝试重连。。。')
			router.value.softOpenService(
				pack.address,
				(): IMessageService =>
					registerRouterServiceAt(pack.address, messageCallback)
			)
		} else console.info('消息发送失败！')
	else console.error('消息路由器未调用！')
}

/**
 * 给路由器指定地址自动注册服务
 * * 默认类型：Websocket客户端
 *
 * @param address 服务地址
 * @param messageCallback 消息回调
 * @returns 消息路由器服务
 */
function registerRouterServiceAt(
	address: string,
	messageCallback: MessageCallback
): IMessageService {
	return new WebSocketServiceClient(...splitAddress(address), messageCallback)
}

// 键控面板 //
const panel: VueElementRefNullable<typeof ControlPanel> = ref(null)
function onKeyEvent(event: KeyboardEvent, isDown: boolean): void {
	panel.value?.onKeyEvent(event, isDown)
}

// 屏显 //
const display: VueElementRefNullable<typeof DisplayField> = ref(null)
/** 处理「屏显连接请求」 */
function handleDisplayLinkRequest(address: string): void {
	router.value?.softOpenService(
		address,
		(): IMessageService =>
			registerRouterServiceAt(address, displayMessageCallback_text)
	)
}
/** 处理「屏显刷新请求」 */
function handleDisplayRefreshRequest(address: string, message: string): void {
	router.value?.send(address, message)
}

/**
 * 用于「文本显示」的回调
 * * 同时用于进一步分派
 */
function displayMessageCallback_text(message: string): undefined {
	// console.log('displayMessageCallback_text: 收到消息', message)
	// 若为「图表」⇒更新图表
	if (message.startsWith('图表')) {
		// 解包
		const data = JSON.parse(message.slice(2))
		plot.value?.append(data?.x, data)
	}
	// 若为「实体列表」⇒更新「附加信息」
	else if (message.startsWith('实体列表'))
		display.value?.updateDisplayScreen({
			// screen:
			otherInf: message,
		})
	// 否则⇒更新「屏显」
	else
		display.value?.updateDisplayScreen({
			screen: message,
		})
	return undefined
}

// 图表 //
const plot: VueElementRefNullable<typeof Plot> = ref(null)
function plotInit(): void {
	console.log('plot.value', plot.value)

	plot.value?.init(plotConfig)
}
</script>

<style scoped></style>
