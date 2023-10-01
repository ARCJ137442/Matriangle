import { GameController } from "../../../../../api/control/GameControl";

/**
 * A type of controller used for player who controlled by AI
 * 
 * * Equals to the former version `AIProgram`
 */
export default class AIController extends GameController {
    public constructor(label: string) {
        super(label);
    }
}
