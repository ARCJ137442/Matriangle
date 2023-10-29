<!--
	* 拥有空的模板
	* 承载各种消息注册服务
 -->
<template></template>

<script setup lang="ts">
import MessageRouter from 'matriangle-mod-message-io-api/MessageRouter'
import { splitAddress } from '../lib/common'
import { IMessageService } from '../../../../mods/message-io-api/MessageInterfaces'
const router = new MessageRouter()

defineExpose({
	/**
	 * 给路由器传递消息
	 */
	send: (address: string, message: string): boolean =>
		router.sendMessageTo(...splitAddress(address), message),
	/**
	 * 检查服务是否存在
	 */
	hasService: (address: string): boolean =>
		router.hasServiceAt(...splitAddress(address)),
	/**
	 * 检查服务是否活跃
	 * * 具体条件：已存在 & 活跃
	 */
	isServiceActive: (address: string): boolean =>
		router.hasServiceAt(...splitAddress(address)) &&
		(router.getServiceAt(...splitAddress(address)) as IMessageService)
			?.isActive,
	/**
	 * 软开启服务
	 * * 没服务⇒使用「新服务构造函数」
	 * * 有服务⇒重启旧服务
	 */
	softOpenService: (
		address: string,
		serviceConstructor: () => IMessageService,
		openedCallback?: () => void
	): void => {
		// 有服务
		const [host, port] = splitAddress(address)
		if (router.hasServiceAt(host, port)) {
			// 活跃⇒返回，非活跃⇒重启
			if ((router.getServiceAt(host, port) as IMessageService).isActive)
				return
			;(router.getServiceAt(host, port) as IMessageService).stop()
			// 在回调中重启，会导致「频繁关闭/重启」（可能因为「关闭的回调延时超过了心跳的时长」）
			;(router.getServiceAt(host, port) as IMessageService).launch(
				openedCallback
			)
		}
		// 没服务
		else router.registerService(serviceConstructor(), openedCallback)
	},
})
</script>
