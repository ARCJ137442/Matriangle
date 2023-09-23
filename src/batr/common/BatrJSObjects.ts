/**
 * 用于BaTr中各类对象到JS对象（再到JSON）的序列化
 */
import { Class } from '../legacy/AS3Legacy';
import { key, safeMerge } from './utils';

/**
 *  ! 对object值的限制：只能为数值、字符串、布尔值、null、数组与其它object（且数值不考虑精度）
 */
export type JSObjectValue = (
    number |
    string |
    boolean |
    null |
    Array<any> |
    JSObject
);

/**
* 可转换为JSON的JS对象类型
*
* ! 对object键的限制：只能为字符串
*/
export type JSObject = {
    [key: string]: JSObjectValue;
};

/**
 * 定义一类「可序列化」成JS原生object的对象
 */
export interface IBatrJSobject<T> {

    /**
     * 将该对象的信息加载到为通用可交换的object格式
     * * 该格式最大地保留了可操作性，并可直接通过`JSON.stringify`方法转化为JSON文本
     * * 【2023-09-23 18:03:55】现在只需要「把数据加载到某个object中」，这样就很容易支持「动态继承性添加属性」了
     *   * 其中的「目标」参数可以留空（默认为空对象），这时相当于原来的`toObject`方法
     *
     * ! 对object键的限制：只能为字符串
     *
     * ! 对object值的限制：只能为数值、字符串、布尔值、null、数组与其它object（且数值不考虑精度）
     *
     * @param target 目标对象
     */
    dumpToObject(target?: JSObject): JSObject;

    /**
     * 用object中的属性覆盖对象
     * * 静态方法可因此使用「`new C()`+`C.copyFromObject(json)`」实现
     * @param source 源头对象
     */
    copyFromObject(source: JSObject): T;

    /**
     * 获取「通用对象化映射表」
     * 
     * 参见`JSObjectifyInf`
     */
    get objectifyMap(): JSObjectifyMap<T>;

}


/**
 * 使用「前缀下划线」快速从JS对象中载入类属性
 *
 * ! 目前只能载入基础类型，内置的「其它类类型」还需要进一步研究（可能根据附加标识进行转换）
 *
 * @param this 取代先前各自类实现里的`this`对象
 * @param source 要从中载入属性的JS对象
 * @param allOwnPropertyKey 源类中要载入的所有属性之列表
 * @returns 载入好的「类对象」
 */
export function fastLoadJSObject_dash<T>(this_: T, source: JSObject, allOwnPropertyKey: key[]): T {
    for (let key in allOwnPropertyKey) {
        // 同有属性⇒加载
        if (source.hasOwnProperty(key)) {
            (this_ as any)[`_${key}`] = safeMerge((this_ as any)[`_${key}`], source[key]);
            console.log("已载入属性", key, "=", (this_ as any)[`_${key}`]);
        }
        // 缺少属性⇒警告
        else
            console.warn("源对象", source, "缺乏属性", key);
    }
    return this_;
}

/**
 * 使用「前缀下划线」快速向JS对象存入类属性
 *
 * ! 目前只能存入基础类型，内置的「其它类类型」还需要进一步研究（可能根据附加标识进行转换）
 *
 * @param this 取代先前各自类实现里的`this`对象
 * @param source 要存入属性的JS对象
 * @param allOwnPropertyKey 源类中要存入的所有属性之列表
 * @returns 存入好的JS对象
 */
export function fastSaveJSObject_dash<T>(this_: T, target: JSObject, allOwnPropertyKey: key[]): JSObject {
    let value: any; // ! 可能是基础类型，也可能是复合对象
    for (let key of allOwnPropertyKey) {
        // 先获取键对应的内部变量值
        value = (this_ as any)[`_${key}`]; // 先获取键对应的内部变量值
        // 然后：有「序列化方法」&已成功序列化（非空）⇒使用这个目标——否则使用本身（处理数值等情况）
        target[key] = value?.dumpToObject({}) ?? (this_ as any)[`_${key}`];
    }
    return target;
}


/**
 * 下面是「通用序列化机制」
 */

/**
 * 统一的JS对象序列化方式
 * 实现这种序列化标准的类，只需提供以下信息
 * ①自身内部属性键:类型→JS对象内的属性键(:同样类型)的「键值对映射」
 * * 这个就是下面定义的类型
 * * 更推广地，可以提供一个「propertyConverter函数」来实现相应的附加操作
 * ②无参数返回一个「模板对象」的「模板构造函数」，用于「新建一个对象，然后往里面塞值」
 * * ②可以在键值对映射里添加方法
 */
export type JSObjectifyMap<T> = {
    [propertyKey: key]: { // 源对象中要对象化的属性
        JSObject_key: key, // 映射到JS对象上的键
        propertyType: string | Class, // 用于判断的类型（string⇒`typeof===`;Class⇒`instanceof`）
        blankConstructor?: () => IBatrJSobject<any>, // 模板构造函数：生成一个「空白的」「可用于后续加载属性的」「白板对象」，也同时用于判断「是否要递归对象化/解对象化」
        propertyConverter: (v: JSObjectValue) => JSObjectValue, // 在「读取原始值」后，对「原始数据」进行一定转换以应用到最终目标加载上的函数
    }
}

/**
 * 根据指定的「对象化映射表」提取一个对象的信息（as any），并将其转换成JS对象
 * 
 * 流程：
 * * 遍历「对象化映射表」中所有的键（源对象中要对象化的属性）
 *   * 在「目标」对象上的「映射后的键」上注入「转换后的值」
 *     * 需要「递归对象化」（一般是其实现了对象化的方法）⇒递归调用转换过程
 *       * 代码上体现为「是否实现了接口声明的方法」
 *     * 否则：值是「基础类型」⇒不做转换
 * 
 * ? 是否要做「沉拷贝」支持
 * @param this_ 待「JS对象化」的对象
 * @param objectifyMap 对象化 映射表
 * @param target 
 * @returns 一个转换好的JS对象
 */
export function uniJSObjectify<T extends IBatrJSobject<T>>(
    this_: T,
    objectifyMap: JSObjectifyMap<T> = this_.objectifyMap,
    target: JSObject = {}
): JSObject {
    // 遍历「对象化映射表」中所有的键
    for (const propertyKey in objectifyMap) {
        // 获取值
        const property: any = (this_ as any)[propertyKey];
        // 映射键
        const JSObjectKey: key = objectifyMap[propertyKey].JSObject_key;
        // 转换值
        if (objectifyMap[propertyKey]?.blankConstructor !== undefined) {
            // 可递归
            target[JSObjectKey] = uniJSObjectify(
                property, // 从当前属性值开始
                property.objectifyMap, // 使用属性值自己的「JS对象化映射表」
                {} // 必从一全新对象开始
            )
        }
        else {
            // 基础类型：直接设置
            target[JSObjectKey] = property;
        }
    }
    // 返回以作管道操作
    return target;
}

/**
 * 根据指定的「对象化映射表」从指定JS对象中加载自身数据
 * 
 * 流程：
 * * 遍历「对象化映射表」中所有的键（源对象中要对象化的属性）
 *   * 在「目标」对象上查找「映射后的键」
 *     * 找到⇒类型还原
 *       * 需要「递归对象化」（一般是其实现了对象化的方法）⇒递归调用转换过程
 *       * 否则⇒基础类型⇒直接拷贝（引用）
 *     * 未找到⇒警告「未找到」
 * 
 * ? 是否要做「沉拷贝」支持
 * @param this_ 数据的载入目标
 * @param objectifyMap 对象化映射表（同构逆用）
 * @param source 数据来源JS对象
 */
export function uniLoadJSObject<T extends IBatrJSobject<T>>(
    this_: T,
    source: JSObject,
    objectifyMap: JSObjectifyMap<T> = this_.objectifyMap,
): T {
    // 遍历「对象化映射表」中所有的键
    for (const propertyKey in objectifyMap) {
        // 映射键
        const JSObjectKey: key = objectifyMap[propertyKey].JSObject_key;
        // 没属性⇒警告，跳过循环
        if (!source.hasOwnProperty(JSObjectKey)) {
            console.warn('在JS对象', source, '中未找到键', JSObjectKey, '对应的数据')
            continue;
        }
        // 获取（原始）值
        const rawProperty: any = source[JSObjectKey];
        // 转换值
        if (objectifyMap[propertyKey]?.blankConstructor !== undefined) {
            // 创造一个该属性「原本类型」的空对象
            const blank: IBatrJSobject<any> = (objectifyMap[propertyKey].blankConstructor as () => IBatrJSobject<any>)();
            // 递归操作
            (this_ as any)[propertyKey] = uniLoadJSObject(
                blank,
                objectifyMap[propertyKey].propertyConverter(rawProperty) as JSObject, // 从当前属性值开始
                blank.objectifyMap, // 使用属性值自己的「JS对象化映射表」
            );
        }
        else {
            // 基础类型：过滤→设置
            (this_ as any)[propertyKey] = safeMerge(
                (this_ as any)[propertyKey], // 原先值的类型以作参考
                objectifyMap[propertyKey].propertyConverter(rawProperty) // 转换后的原始值
            );
        }
    }
    return this_;
}