export default class batrFla extends MovieClip {
	public sub: BatrSubject = new BatrSubject();
	public fixed_mapID: uint = 0;
	public temp_JSON: string;

	public constructor() {
		super();
		this.addChild(sub);
		sub.turnToMenu();
		sub.gameRule.playerCount = 4;
		sub.gameRule.AICount = 6;
		//sub.gameRule.defaultToolID=ToolType.RANDOM_AVAILABLE_ID;
		//sub.gameRule.toolsNoCD=false
		stage.addEventListener(KeyboardEvent.KEY_DOWN, onKD);
	}

	public onKD(E: KeyboardEvent): void {
		let code: uint = E.keyCode;
		let ctrl: boolean = E.ctrlKey
		let alt: boolean = E.altKey
		let shift: boolean = E.shiftKey
		/* Debug Functions:
		 * M:Menu
		 * G:Game
		 * R:Team(Color)
		 * T:Pos/Map
		 * C:Projectile/Effect
		 * V:Tool
		 * X:Sheet/I18ns
		 * L:Game UUID List
		 * <`~>:Game Speed
		 * N:Append Player
		 * <Enter>:Game Ticking
		 */
		if (!sub.gameObj.isLoaded) return;
		switch (code) {

			// R: change teams
			case KeyCode.R:
				if (ctrl || ctrl && shift) sub.gameObj.setATeamToAIPlayer();
				else if (shift) sub.gameObj.setATeamToNotAIPlayer();
				else sub.gameObj.randomizeAllPlayerTeam();
				break;
			// T: change position/map
			case KeyCode.T:
				if (ctrl) {
					if (shift) sub.gameObj.transformMap(Game.ALL_MAPS[fixed_mapID = exMath.intMod(fixed_mapID - 1, Game.VALID_MAP_COUNT)]);
					else sub.gameObj.transformMap(Game.ALL_MAPS[fixed_mapID = exMath.intMod(fixed_mapID + 1, Game.VALID_MAP_COUNT)]);
					trace('Now transform map to:', sub.gameObj.map.name);
				}
				else if (shift) sub.gameObj.transformMap();
				else sub.gameObj.spreadAllPlayer();
				break;
			// C: remove all projectiles/effects
			case KeyCode.C:
				if (shift) sub.gameObj.effectSystem.clearEffect();
				else sub.gameObj.entitySystem.clearProjectile();
				break;
			// V: change tools
			case KeyCode.V:
				if (shift) sub.gameObj.changeAllPlayerTool();
				else sub.gameObj.changeAllPlayerToolRandomly();
				break;
			// B: control bonus boxes
			case KeyCode.B:
				if (ctrl) sub.gameObj.fillBonusBox();
				else if (shift) sub.gameObj.entitySystem.clearBonusBox();
				else sub.gameObj.randomAddRandomBonusBox();
				break;
			// ENTER: deal game tick
			case KeyCode.ENTER:
				sub.gameObj.dealGameTick();
				break;
			// BACK_QUOTES: manipulate speed
			case KeyCode.BACK_QUOTES:
				if (ctrl && shift) sub.gameObj.speed = 1; // Reset speed
				else if (shift) sub.gameObj.speed /= 2;
				else if (ctrl) sub.gameObj.speed += 1;
				else sub.gameObj.speed *= 2;
				break;
			//L: List UUIDs
			case KeyCode.L:
				if (shift)
					trace('List of Effect UUIDs:', sub.gameObj.effectSystem.getAllUUID());
				else trace('List of Entity UUIDs:', sub.gameObj.entitySystem.getAllUUID());
				break;
			//E: Test game end
			case KeyCode.E:
				sub.gameObj.testGameEnd(shift);
				break;
			//N: Create
			case KeyCode.N:
				if (ctrl)
					if (shift) { // Append a 'SuperAI'
						let p = sub.gameObj.appendAI();
						p.AIRunSpeed = alt ? Infinity : 1000;
					}
					else sub.gameObj.appendAI();

				else sub.gameObj.appendPlayer();
				break;
		}
	}
}
