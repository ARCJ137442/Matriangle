import { randInt } from "../../../../../../../common/exMath";
import { uint } from "../../../../../../../legacy/AS3Legacy";
import { EnumPlayerAction, PlayerEvent } from "../PlayerAction";
import AIControllerGenerator, { AIActionGenerator } from "./AIControllerGenerator";
import { getPlayerActionFromTurn } from './../PlayerAction';

/**
 * 使用「行为生成器」的形式，用生成函数还原所有先前的「AI程序」
 */
export module NativeAIPrograms {

    export function* AIProgram_Dummy(controller: AIControllerGenerator): AIActionGenerator {
        // 自身程序状态⇒函数局部变量
        let _moveSum: uint = 0;
        let _moveMaxSum: uint = 4 + randInt(16);
        let _tempRot: uint;

        let e: PlayerEvent = yield EnumPlayerAction.NULL;
        while (true) {
            // 屏蔽其它事件
            if (e !== PlayerEvent.AI_TICK) yield EnumPlayerAction.NULL;
            // 检查未定义值，不应该的情况就报错
            if (controller._temp_currentPlayer === undefined) throw new Error("AIProgram_Dummy: controller._temp_currentPlayer is undefined");
            if (controller._temp_currentHost === undefined) throw new Error("AIProgram_Dummy: controller._temp_currentHost is undefined");
            // Press Use
            if (controller._temp_currentPlayer.tool.reverseCharge) {
                if (controller._temp_currentPlayer.tool.chargingPercent >= 1)
                    e = yield EnumPlayerAction.START_USING;
                else if (controller._temp_currentPlayer.isUsing)
                    e = yield EnumPlayerAction.STOP_USING;
            }
            else if (!controller._temp_currentPlayer.isUsing)
                e = yield EnumPlayerAction.START_USING;
            // Act
            if (_moveSum >= _moveMaxSum ||
                !controller._temp_currentPlayer.testCanGoForward(
                    controller._temp_currentHost
                )) {
                _moveSum = 0;
                let i: uint = 0;
                do {
                    _tempRot = controller._temp_currentHost.map.storage.randomForwardDirectionAt(
                        controller._temp_currentPlayer.position
                    );
                    i++;
                }
                while (i <= 8 && !controller._temp_currentPlayer.testCanGoForward(
                    controller._temp_currentHost
                ));
                // TODO: 这里需要解决「同时输出多个玩家行为」的问题
                // controller._temp_currentPlayer.addActionToThread(EnumPlayerAction.DISABLE_CHARGE);
                e = yield getPlayerActionFromTurn(_tempRot);
            }
            _moveSum++;
            e = yield EnumPlayerAction.MOVE_FORWARD;
        }
    }
}
