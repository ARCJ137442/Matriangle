import { Ref } from 'vue'

/**
 * 封装好的「Vue可空组件引用」类型
 * * 参考：https://cn.vuejs.org/guide/typescript/composition-api.html#typing-component-template-refs
 */
export type VueElementRefNullable<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	T extends abstract new (...args: any) => any,
> = Ref<InstanceType<T> | null>

/**
 * 把一个链接地址分拆成「主机地址」与「服务端口」
 *
 * @param url 要分解的地址（不含协议头）
 * @return {[string, number]} 一个新数组，形式为`[主机地址, 服务端口]`
 */
export function splitAddress(url: string): [string, number] {
	const [host, port] = url.split(':')
	return [host, port ? parseInt(port, 10) : 80]
}

/** 空函数 */
export const omega = (): void => {}
/** 空函数1 */
export const omega1 = <T = unknown>(any: T): undefined => void any
