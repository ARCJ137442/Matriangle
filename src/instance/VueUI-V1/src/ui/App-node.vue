<template>
	<MessageCenter ref="router" />

	<h1>控制</h1>
	<ControlPanel
		ref="panel"
		@message="pack => sendMessagePackAsClient(pack, panel?.onMessage)"
		@link-change="handleLinkChangeAtClient"
	/>

	<h1>显示</h1>
	<DisplayPanel
		ref="displayPanel"
		@link-start="handleLinkStartRequestAtClient"
		@link-change="handleLinkChangeAtClient"
		@refresh="handleDisplayRefreshRequest"
	/>

	<h1>数据</h1>
	<DataPanel
		ref="dataPanel"
		@link-start="handleLinkStartRequestAtClient"
		@link-change="handleLinkChangeAtClient"
		@message-request="handleMessageRequest"
	/>
</template>

<script setup lang="ts">
/**
 * ! 负责处理网络联系，沟通各个子组件
 * * 如：
 *   * 从「控制面板」获得控制信息，把键控消息传递给Websocket连接
 *   * 从Websocket连接中获取消息，传递给「屏幕」和「图表」
 *
 * !【2023-11-06 21:13:05】谢绝了「common-app」的想法
 * * 这个想法通过引入一个`CommonAPP`类的方式，尝试复用这个script标签中的代码
 * * 但实际上可能因为「Vue模块无法在TS中兼容」（即TS文件依赖Vue文件）等原因，
 * * 最终无法实现
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
import DisplayPanel from './DisplayPanel.vue'
import DataPanel from './DataPanel.vue'
import {
	IMessageService,
	MessageCallback,
} from 'matriangle-mod-message-io-api/MessageInterfaces'
import { voidF } from '../../../../common'

// diff //
const router: VueElementRefNullable<typeof MessageCenter> = ref(null)

/**
 * 给路由器指定地址自动注册服务
 * * 默认类型：Websocket客户端
 *
 * ! 和「浏览器端」不同的地方之一
 *
 * @param address 服务地址
 * @param messageCallback 消息回调
 * @returns 消息路由器服务
 */
function registerRouterServiceAt(
	address: string,
	messageCallback: MessageCallback
): IMessageService {
	// 预先检查（理论上一定有！）
	if (router.value === null) throw new Error('未找到路由器！')
	// 构造服务
	return new WebSocketServiceClient(...splitAddress(address), messageCallback)
}

/// 开始 ///

// 全局侦听器 //
window.addEventListener('keydown', (e: KeyboardEvent): void =>
	onKeyEvent(e, true)
)
window.addEventListener('keyup', (e: KeyboardEvent): void =>
	onKeyEvent(e, false)
)

// 消息路由 //
type MessagePack = { address: string; message: string }
/**
 * 向（客户端）路由器转发消息
 * * 附带「响应式自动重连」功能
 */
function sendMessagePackAsClient(
	pack: MessagePack,
	messageCallback: MessageCallback = omega1<string>
): void {
	// 检查路由器是否为空
	if (router.value !== null)
		if (pack.address === undefined || pack.message === undefined)
			// 检查消息包是否有效
			console.error('消息包无效！', pack)
		// 检查消息是否发送成功
		else if (router.value.routerClient.send(pack.address, pack.message))
			void 0
		// 服务不存在⇒尝试重连
		else if (!router.value.routerClient.hasService(pack.address)) {
			console.warn(`服务「${pack.address}」不存在！`)
			console.info('正在尝试重连。。。')
			router.value.routerClient.softOpenService(
				pack.address,
				(): IMessageService =>
					registerRouterServiceAt(pack.address, messageCallback)
			)
		}
		// 纯粹发送失败
		else console.info('消息发送失败！')
	else console.error('消息路由器未调用！')
}

/** 处理（客户端的）「开始连接请求」 */
function handleLinkStartRequestAtClient(
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

/** 处理（客户端的）「地址变更」请求 */
const handleLinkChangeAtClient = (
	oldAddress: string,
	newAddress: string
): void =>
	// 直接调用路由器方法
	router.value?.routerClient?.handleAddressChange(oldAddress, newAddress)

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
	// 控制客户端发送消息
	router.value.routerClient.softSend(address, message) //if ()
	// console.log('屏显刷新请求成功发送：', address, message)
}

// 数据 //
const dataPanel: VueElementRefNullable<typeof DataPanel> = ref(null)

/** 处理「数据显示面板 刷新请求」 */
function handleMessageRequest(address: string, message: string): void {
	console.log(
		'数据显示面板 刷新请求:',
		address,
		message,
		router.value?.routerClient.isServiceActive(address)
	)
	router.value?.routerClient.send(address, message)
}
</script>

<style scoped></style>
