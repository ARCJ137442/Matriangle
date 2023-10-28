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
			;(router.getServiceAt(host, port) as IMessageService).launch(
				openedCallback
			)
		}
		// 没服务
		else router.registerService(serviceConstructor(), openedCallback)
	},
})
</script>
