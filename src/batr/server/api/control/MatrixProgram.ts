import Entity from "../entity/Entity";

/**
 * 母体程序的「标签」类型
 * * 目前用于标识一个程序的身份与用途
 */
export type MatrixProgramLabel = string;

/**
 * 「母体程序」是一个
 * * 拥有可自定义的「标签」的
 * 实体
 * 
 * ! 与「实体」的核心语义区别
 * * 「实体」泛指「任意物体」，类似「物质」
 * * 「程序」泛指「有『自主行动』特性的物体」，类似「生命」
 * 
 * 典例：
 * * 控制游戏随机刻
 * 
 * 📌【2023-10-07 12:15:29】想法记录
 * > 重定位「程序」「实体」
 * > 非程序实体是死的，程序是活的
 * > 订阅系统？不一定被需要
 * > Programs hacking programs...
 * 
 * TODO: 后续将细化用途
 */
export abstract class MatrixProgram extends Entity {

	/**
	 * @constructor 构造函数
	 */
	public constructor(
		/**
		 * 程序标签
		 * * 应用：标识程序的身份与用途
		 * * 参考：`MatrixProgramLabel`
		 */
		public readonly label: MatrixProgramLabel,
	) {
		super();
	}
}
