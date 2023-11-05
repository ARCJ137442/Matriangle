<template>
	<MessageCenter ref="router" />

	<h1>控制</h1>
	<ControlPanel
		ref="panel"
		@message="pack => sendMessagePack(pack)"
		@link-change="handleLinkChange"
	/>

	<h1>显示</h1>
	<DisplayPanel
		ref="displayPanel"
		@link-start="handleLinkStartRequest"
		@link-change="handleLinkChange"
		@refresh="handleDisplayRefreshRequest"
	/>

	<h1>数据</h1>
	<DataPanel
		ref="dataPanel"
		@link-start="handleLinkStartRequest"
		@link-change="handleLinkChange"
		@config-request="handleConfigRequest"
	/>
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
import MessageCenter from './MessageCenter.vue'
import {
	IMessageService,
	MessageCallback,
} from 'matriangle-mod-message-io-api/MessageInterfaces'
import DisplayPanel from './DisplayPanel.vue'
import DataPanel from './DataPanel.vue'
import { voidF } from '../../../../common'

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
const router: VueElementRefNullable<typeof MessageCenter> = ref(null)
/* setInterval((): void => {
	console.log(router.value?.router)
}, 1000) */ // 【2023-10-29 00:52:30】测试成功
/**
 * 向路由器输送消息
 * * 附带「响应式自动重连」功能
 */
function sendMessagePack(
	pack: MessagePack,
	messageCallback: MessageCallback = omega1<string>
): void {
	if (router.value !== null)
		if (pack.address === undefined || pack.message === undefined)
			console.error('消息包无效！', pack)
		else if (router.value.routerClient.send(pack.address, pack.message))
			void 0
		else if (!router.value.routerClient.hasService(pack.address)) {
			console.warn(`服务「${pack.address}」不存在！`)
			console.info('正在尝试重连。。。')
			router.value.routerClient.softOpenService(
				pack.address,
				(): IMessageService =>
					registerRouterServiceAt(pack.address, messageCallback)
			)
		} else console.info('消息发送失败！')
	else console.error('消息路由器未调用！')
}

/** 处理「开始连接请求」 */
function handleLinkStartRequest(
	address: string,
	heartbeatTimeMS: number,
	callbackMessage: MessageCallback,
	callbackConnected?: voidF,
	callbackStop?: voidF
): void {
	router.value?.routerClient.openKeepConnectService(
		address,
		heartbeatTimeMS,
		// 若无服务：让路由器新建服务
		(): IMessageService =>
			registerRouterServiceAt(address, callbackMessage),
		// 回调：通知服务启动
		callbackConnected,
		// 回调：当发送连接时发现「服务不再活跃」，通知「服务关闭」
		callbackStop
	)
}

/** 处理「地址变更」请求 */
const handleLinkChange = (oldAddress: string, newAddress: string): void =>
	// 直接调用路由器方法
	router.value?.routerClient.handleAddressChange(oldAddress, newAddress)

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
const displayPanel: VueElementRefNullable<typeof DisplayPanel> = ref(null)
/**
 * 处理「屏显刷新请求」
 *
 * !【2023-10-29 21:08:46】注意：刷新速度过快会导致服务端过载，造成「屏显不响应」的假象
 */
function handleDisplayRefreshRequest(address: string, message: string): void {
	if (router.value === null) return console.error('未找到路由器！')

	router.value.routerClient.softSend(address, message) //if ()
	// console.log('屏显刷新请求成功发送：', address, message)
}

// 数据 //
const dataPanel: VueElementRefNullable<typeof DataPanel> = ref(null)

/** 处理「配置刷新请求」 */
function handleConfigRequest(address: string, message: string): void {
	console.log(
		'配置刷新请求:',
		address,
		message,
		router.value?.routerClient.isServiceActive(address)
	)
	router.value?.routerClient.send(address, message)
}
</script>

<style scoped></style>
