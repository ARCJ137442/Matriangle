package batr.game.entity.entity.players {

	import batr.common.*;
	import batr.general.*;
	import batr.game.stat.*;
	import batr.game.entity.player.profile.IPlayerProfile;

	import batr.game.block.*;
	import batr.game.entity.entity.*;
	import batr.game.entity.entity.player.*;
	import batr.game.entity.*;
	import batr.game.entity.object.*;
	import batr.game.model.*;
	import batr.game.main.*;

	import flash.display.*;
	import flash.geom.*;

	export default class Player extends EntityCommon implements IPlayerProfile {
		//============Static Variables============//
		public static const SIZE: number = 1 * GlobalGameVariables.DEFAULT_SIZE;
		public static const LINE_SIZE: number = GlobalGameVariables.DEFAULT_SIZE / 96;
		public static const CARRIED_BLOCK_ALPHA: number = 1 / 4;

		public static const DEFAULT_MAX_HEALTH: int = 100;
		public static const DEFAULT_HEALTH: int = DEFAULT_MAX_HEALTH;
		public static const MAX_DAMAGE_DELAY: uint = 0.5 * GlobalGameVariables.FIXED_TPS;
		public static function isAI(player: Player): boolean {
			return player is AIPlayer;
		}

		public static function getUplevelExperience(level: uint): uint {
			return (level + 1) * 5 + (level >> 1);
		}

		//============Instance Variables============//
		protected _team: PlayerTeam;

		protected _customName: string;

		protected _weapon: WeaponType;

		protected _droneWeapon: WeaponType = GameRule.DEFAULT_DRONE_WEAPON;

		//====Graphics Variables====//
		protected _lineColor: uint = 0x888888;
		protected _fillColor: uint = 0xffffff;
		protected _fillColor2: uint = 0xcccccc;

		protected _GUI: PlayerGUI;

		protected _carriedBlock: BlockCommon;

		//====Contol Variables====//
		// ContolDelay
		public contolDelay_Move: uint = GlobalGameVariables.FIXED_TPS * 0.5;

		// public contolDelay_Use:uint=GlobalGameVariables.TPS/4
		// public contolDelay_Select:uint=GlobalGameVariables.TPS/5

		// ContolLoop
		public contolLoop_Move: uint = GlobalGameVariables.FIXED_TPS * 0.05;

		// public contolLoop_Use:uint=GlobalGameVariables.TPS/25
		// public contolLoop_Select:uint=GlobalGameVariables.TPS/40

		// ContolKey
		public contolKey_Up: uint;
		public contolKey_Down: uint;
		public contolKey_Left: uint;
		public contolKey_Right: uint;
		public contolKey_Use: uint;
		// public ContolKey_Select_Left:uint;
		// public ContolKey_Select_Right:uint;

		// isPress
		public isPress_Up: boolean;
		public isPress_Down: boolean;
		public isPress_Left: boolean;
		public isPress_Right: boolean;
		public isPress_Use: boolean;
		// public isPress_Select_Left:Boolean;
		// public isPress_Select_Right:Boolean;

		// KeyDelay
		public keyDelay_Move: int;
		// public keyDelay_Use:int;
		// public keyDelay_Select:int;

		//========Custom Variables========//
		// Health
		protected _health: uint = DEFAULT_HEALTH;

		protected _maxHealth: uint = DEFAULT_MAX_HEALTH;

		protected _heal: uint = 0;

		protected _lives: uint = 10;

		protected _infinityLife: boolean = true;

		// Weapon
		protected _weaponUsingCD: uint = 0;

		protected _weaponChargeTime: int = -1;

		protected _weaponChargeMaxTime: uint = 0;

		// Respawn
		public respawnTick: int = -1;

		// negative number means isn't respawning

		// Gameplay
		protected _lastHurtbyPlayer: Player = null;

		protected _stats: PlayerStats;

		protected _damageDelay: int = 0;

		protected _healDelay: uint = 0;

		//========Attributes========//
		public moveDistence: uint = 1;

		public invulnerable: boolean = false;

		//====Experience====//
		protected _experience: uint = 0;

		public get experience(): uint {
			return this._experience;
		}

		public set experience(value: uint): void {
			while (value > this.uplevelExperience) {
				value -= this.uplevelExperience;
				this.level++;
				this.onLevelup();
			}
			this._experience = value;
			if (this._GUI != null)
				this._GUI.updateExperience();

		}

		/**
		 * If the experience up to uplevelExperience,level++
		 */
		protected _level: uint = 0;

		public get level(): uint {
			return this._level;
		}

		public set level(value: uint): void {
			this._level = value;
		}

		public get uplevelExperience(): uint {
			return Player.getUplevelExperience(this._level);
		}

		public get experiencePercent(): number {
			return this._experience / this.uplevelExperience;
		}

		//====Buff====//

		/**
		 * The EXTRA power of Damage
		 * #TotalDamage=WeaponDamage+buff*WeaponCoefficient
		 */
		protected _buffDamage: uint = 0;

		public get buffDamage(): uint {
			return this._buffDamage;
		}

		public set buffDamage(value: uint): void {
			this._buffDamage = value;
		}

		/**
		 * The EXTRA power of Weapon Usage CD
		 * #TotalCD=WeaponCD/(1+buff/10)
		 */
		protected _buffCD: uint = 0;

		public get buffCD(): uint {
			return this._buffCD;
		}

		public set buffCD(value: uint): void {
			this._buffCD = value;
		}

		/**
		 * The EXTRA power of Resistance
		 * #FinalDamage=TotalDamage-buff*WeaponCoefficient>0
		 */
		protected _buffResistance: uint = 0;

		public get buffResistance(): uint {
			return this._buffResistance;
		}

		public set buffResistance(value: uint): void {
			this._buffResistance = value;
		}

		/**
		 * The EXTRA power of Radius
		 * #FinalRadius=DefaultRadius*(1+buff/10)
		 */
		protected _buffRadius: uint = 0;

		public get buffRadius(): uint {
			return this._buffRadius;
		}

		public set buffRadius(value: uint): void {
			this._buffRadius = value;
		}

		//============Constructor Function============//
		public Player(
			host: Game,
			x: number,
			y: number,
			team: PlayerTeam,
			contolKeyId: uint,
			isActive: boolean = true,
			fillColor: number = NaN,
			lineColor: number = NaN): void {
			super(host, x, y, isActive);
			// Set Team
			this._team = team;
			// Set Stats
			this._stats = new PlayerStats(this);
			// Set Shape
			this.initColors(fillColor, lineColor);
			this.drawShape();
			// Set GUI And Effects
			this._GUI = new PlayerGUI(this);

			this.addChildren();

			// Set Contol Key
			this.initContolKey(contolKeyId);
			this.updateKeyDelay();
		}

		//============Destructor Function============//
		public override function destructor(): void {
			// Reset Key
			this.turnAllKeyUp();
			this.clearContolKeys();
			// Remove Display Object
			Utils.removeChildIfContains(this._host.playerGUIContainer, this._GUI);
			// Remove Variables
			// Primitive
			this._customName = null;
			this._weaponUsingCD = 0;
			this._team = null;
			// Complex
			this._stats.destructor();
			this._stats = null;
			this._lastHurtbyPlayer = null;
			this._weapon = null;
			this._GUI.destructor();
			this._GUI = null;
			// Call Super Class
			super.destructor();
		}

		//============Instance Getter And Setter============//
		public get gui(): PlayerGUI {
			return this._GUI;
		}

		/**
		 * Cannot using INT to return!
		 * Because it's on the center of block!
		 */
		public get frontX(): number {
			return this.getFrontIntX(this.moveDistence);
		}

		/**
		 * Cannot using INT to return!
		 * Because it's on the center of block!
		 */
		public get frontY(): number {
			return this.getFrontIntY(this.moveDistence);
		}

		public get team(): PlayerTeam {
			return this._team;
		}

		public set team(value: PlayerTeam): void {
			if (value == this._team)
				return;
			this._team = value;
			this.initColors();
			this.drawShape();
			this._GUI.updateTeam();
			this._host.updateProjectilesColor();
		}

		public get teamColor(): uint {
			return this.team.defaultColor;
		}

		public get stats(): PlayerStats {
			return this._stats;
		}

		public get weapon(): WeaponType {
			return this._weapon;
		}

		/**
		 * This weapon is used by drones created from another weapon
		 */
		public get droneWeapon(): WeaponType {
			return this._droneWeapon;
		}

		public set droneWeapon(value: WeaponType): void {
			this._droneWeapon = value;
		}

		/**
		 * Also Reset CD&Charge
		 */
		public set weapon(value: WeaponType): void {
			if (value == this._weapon)
				return;
			this.resetCD();
			this.resetCharge(true, false);
			this.onWeaponChange(this._weapon, value);
			this._weapon = value;
		}

		public get weaponUsingCD(): uint {
			return this._weaponUsingCD;

		}

		public set weaponUsingCD(value: uint): void {
			if (value == this._weaponUsingCD)
				return;

			this._weaponUsingCD = value;

			this._GUI.updateCD();

		}

		public get weaponChargeTime(): int {
			return this._weaponChargeTime;

		}

		public set weaponChargeTime(value: int): void {
			if (value == this._weaponChargeTime)
				return;

			this._weaponChargeTime = value;

			this._GUI.updateCharge();

		}

		public get weaponChargeMaxTime(): uint {
			return this._weaponChargeMaxTime;

		}

		public set weaponChargeMaxTime(value: uint): void {
			if (value == this._weaponChargeMaxTime)
				return;

			this._weaponChargeMaxTime = value;

			this._GUI.updateCharge();

		}

		public get weaponNeedsCD(): boolean {
			if (this._weapon == null)
				return false;

			return this.weaponMaxCD > 0;

		}

		public get weaponMaxCD(): number {
			return this._host.rule.weaponsNoCD ? GlobalGameVariables.WEAPON_MIN_CD : this._weapon.getBuffedCD(this.buffCD);
		}

		public get weaponReverseCharge(): boolean {
			return this._weapon.reverseCharge;
		}

		public get weaponCDPercent(): number {
			if (!this.weaponNeedsCD)
				return 1;

			return this._weaponUsingCD / this.weaponMaxCD;

		}

		public get weaponNeedsCharge(): boolean {
			if (this._weapon == null)
				return false;

			return this._weapon.defaultChargeTime > 0;

		}

		public get isCharging(): boolean {
			if (!this.weaponNeedsCharge)
				return false;

			return this._weaponChargeTime >= 0;

		}

		public get chargingPercent(): number { // 0~1
			if (!this.weaponNeedsCharge)
				return 1;

			if (!this.isCharging)
				return 0;

			return this._weaponChargeTime / this._weaponChargeMaxTime;

		}

		// Color
		public get lineColor(): uint {
			return this._lineColor;

		}

		public get fillColor(): uint {
			return this._fillColor;

		}

		// Health,MaxHealth,Life&Respawn
		public get health(): uint {
			return this._health;

		}

		public set health(value: uint): void {
			if (value == this._health)
				return;

			this._health = Math.min(value, this._maxHealth);

			if (this._GUI != null)
				this._GUI.updateHealth();

		}

		public get maxHealth(): uint {
			return this._maxHealth;

		}

		public set maxHealth(value: uint): void {
			if (value == this._maxHealth)
				return;

			this._maxHealth = value;

			if (value < this._health)
				this._health = value;

			this._GUI.updateHealth();

		}

		public get isFullHealth(): boolean {
			return this._health >= this._maxHealth;

		}

		public get heal(): uint {
			return this._heal;

		}

		public set heal(value: uint): void {
			if (value == this._heal)
				return;

			this._heal = value;

			this._GUI.updateHealth();

		}

		public get lives(): uint {
			return this._lives;

		}

		public set lives(value: uint): void {
			if (value == this._lives)
				return;

			this._lives = value;

			this._GUI.updateHealth();

		}

		public get infinityLife(): boolean {
			return this._infinityLife;

		}

		public set infinityLife(value: boolean): void {
			if (value == this._infinityLife)
				return;

			this._infinityLife = value;

			this._GUI.updateHealth();

		}

		public get isRespawning(): boolean {
			return this.respawnTick >= 0;

		}

		public get healthPercent(): number {
			return this.health / this.maxHealth;

		}

		public get isCertainlyOut(): boolean {
			return this.lives == 0 && this.health == 0 && !this.isActive;
		}

		// Display for GUI
		public get healthText(): string {
			var healthText: string = this._health + '/' + this._maxHealth;

			var healText: string = this._heal > 0 ? '<' + this._heal + '>' : '';

			var lifeText: string = this._infinityLife ? '' : '[' + this._lives + ']';

			return healthText + healText + lifeText;

		}

		public get customName(): string {
			return this._customName;

		}

		public set customName(value: string): void {
			if (value == this._customName)
				return;

			this._customName = value;

			this._GUI.updateName();

		}

		// Other
		public get lastHurtbyPlayer(): Player {
			return this._lastHurtbyPlayer;

		}

		// Key&Control
		public get someKeyDown(): boolean {
			return (this.isPress_Up ||
				this.isPress_Down ||
				this.isPress_Left ||
				this.isPress_Right ||
				this.isPress_Use /*||
					this.isPress_Select_Left||
					this.isPress_Selec_Right*/);

		}

		public get someMoveKeyDown(): boolean {
			return (this.isPress_Up ||
				this.isPress_Down ||
				this.isPress_Left ||
				this.isPress_Right);

		}
		/*
		public get someSelectKeyDown():Boolean {
			return (this.isPress_Select_Left||this.isPress_Selec_Right)
		}*/

		public set pressLeft(turn: boolean): void {
			this.isPress_Left = turn;

		}

		public set pressRight(turn: boolean): void {
			this.isPress_Right = turn;

		}

		public set pressUp(turn: boolean): void {
			this.isPress_Up = turn;

		}

		public set pressDown(turn: boolean): void {
			this.isPress_Down = turn;

		}

		public set pressUse(turn: boolean): void {
			if (this.isPress_Use && !turn) {
				this.isPress_Use = turn;

				if (isCharging)
					this.onDisableCharge();

				return;

			}
			this.isPress_Use = turn;

		}

		/*public set pressLeftSelect(turn:Boolean):void {
			this.isPress_Select_Left=turn
		}
		
		public set pressRightSelect(turn:Boolean):void {
			this.isPress_Select_Right=turn
		}*/

		// Entity Type
		public override function get type(): EntityType {
			return EntityType.PLAYER;

		}

		//============Instance Functions============//
		//====Functions About Rule====//

		/**
		 * This function init the variables without update when this Player has been created.
		 * @param	weaponID	invaild number means random.
		 * @param	uniformWeapon	The uniform weapon
		 */
		public initVariablesByRule(weaponID: int, uniformWeapon: WeaponType = null): void {
			// Health&Life
			this._maxHealth = this._host.rule.defaultMaxHealth;

			this._health = this._host.rule.defaultHealth;

			this.setLifeByInt(this is AIPlayer ? this._host.rule.remainLifesAI : this._host.rule.remainLifesPlayer);

			// Weapon
			if (weaponID < -1)
				this._weapon = this.host.rule.randomWeaponEnable;
			else if (!WeaponType.isValidAvailableWeaponID(weaponID) && uniformWeapon != null)
				this._weapon = uniformWeapon;
			else
				this._weapon = WeaponType.fromWeaponID(weaponID);

		}

		//====Functions About Health====//
		public addHealth(value: uint, healer: Player = null): void {
			this.health += value;

			this.onHeal(value, healer);

		}

		public removeHealth(value: uint, attacker: Player = null): void {
			if (invulnerable)
				return;
			this._lastHurtbyPlayer = attacker;
			if (health > value) {
				this.health -= value;
				this.onHurt(value, attacker);
			}
			else {
				this.health = 0;
				this.onDeath(health, attacker);
			}
		}

		public setLifeByInt(lives: number): void {
			this._infinityLife = (lives < 0);
			if (this._lives >= 0)
				this._lives = lives;
		}

		//====Functions About Hook====//
		protected onHeal(amount: uint, healer: Player = null): void {

		}

		protected onHurt(damage: uint, attacker: Player = null): void {
			// this._hurtOverlay.playAnimation();
			this._host.addPlayerHurtEffect(this);
			this._host.onPlayerHurt(attacker, this, damage);
		}

		protected onDeath(damage: uint, attacker: Player = null): void {
			this._host.onPlayerDeath(attacker, this, damage);
			if (attacker != null)
				attacker.onKillPlayer(this, damage);
		}

		protected onKillPlayer(victim: Player, damage: uint): void {
			if (victim != this && !this.isRespawning)
				this.experience++;
		}

		protected onRespawn(): void {

		}

		public onMapTransform(): void {
			this.resetCD();
			this.resetCharge(false);
		}

		public onPickupBonusBox(box: BonusBox): void {

		}

		public override function preLocationUpdate(oldX: number, oldY: number): void {
			this._host.prePlayerLocationChange(this, oldX, oldY);
			super.preLocationUpdate(oldX, oldY);
		}

		public override function onLocationUpdate(newX: number, newY: number): void {
			if (this._GUI != null) {
				this._GUI.entityX = this.entityX;
				this._GUI.entityY = this.entityY;
			}
			this._host.onPlayerLocationChange(this, newX, newY);
			super.onLocationUpdate(newX, newY);
		}

		public onLevelup(): void {
			this._host.onPlayerLevelup(this);
		}

		//====Functions About Gameplay====//

		/**
		 * @param	player	The target palyer.
		 * @param	weapon	The weapon.
		 * @return	If player can hurt target with this weapon.
		 */
		public canUseWeaponHurtPlayer(player: Player, weapon: WeaponType): boolean {
			return (isEnemy(player) && weapon.weaponCanHurtEnemy ||
				isSelf(player) && weapon.weaponCanHurtSelf ||
				isAlly(player) && weapon.weaponCanHurtAlly);

		}

		public filterPlayersThisCanHurt(players: Player[], weapon: WeaponType): Player[] {
			return players.filter(
				function (player: Player, index: int, vector: Player[]) {
					return this.canUseWeaponHurtPlayer(player, weapon);
				}, this
			);
		}

		public isEnemy(player: Player): boolean {
			return (!isAlly(player, true));

		}

		public isSelf(player: Player): boolean {
			return player === this;

		}

		public isAlly(player: Player, includeSelf: boolean = false): boolean {
			return player != null && ((includeSelf || !isSelf(player)) &&
				this.team === player.team);

		}

		public get carriedBlock(): BlockCommon {
			return this._carriedBlock;

		}

		public get isCarriedBlock(): boolean {
			return this._carriedBlock != null && this._carriedBlock.visible;

		}

		public dealMoveInTestOnLocationChange(x: number, y: number, ignoreDelay: boolean = false, isLocationChange: boolean = false): void {
			this.dealMoveInTest(x, y, ignoreDelay, isLocationChange);

		}

		public dealMoveInTest(x: number, y: number, ignoreDelay: boolean = false, isLocationChange: boolean = false): void {
			if (ignoreDelay) {
				this._host.moveInTestPlayer(this, isLocationChange);
				this._damageDelay = MAX_DAMAGE_DELAY;
			}
			else if (this._damageDelay > 0) {
				this._damageDelay--;
			}
			else if (this._damageDelay == 0 && this._host.moveInTestPlayer(this, isLocationChange)) {
				this._damageDelay = MAX_DAMAGE_DELAY;
			}
			else if (this._damageDelay > -1) {
				this._damageDelay = -1;
			}
		}

		public dealHeal(): void {
			if (this._heal < 1)
				return;
			if (this._healDelay > GlobalGameVariables.TPS * (0.1 + this.healthPercent * 0.15)) {
				if (this.isFullHealth)
					return;
				this._healDelay = 0;
				this._heal--;
				this.health++;
			}
			else {
				this._healDelay++;
			}
		}

		//====Functions About Respawn====//
		public dealRespawn(): void {
			if (this.respawnTick > 0)
				this.respawnTick--;

			else {
				this.respawnTick = -1;
				if (!this._infinityLife && this._lives > 0)
					this._lives--;
				this._host.onPlayerRespawn(this);
				this.onRespawn();
			}
		}

		//====Functions About Weapon====//
		protected onWeaponChange(oldType: WeaponType, newType: WeaponType): void {
			this.initWeaponCharge();
			this.resetCharge(false);
			// Change Drone Weapon
			if (WeaponType.isDroneWeapon(newType)) {
				if (WeaponType.isBulletWeapon(oldType))
					this._droneWeapon = WeaponType.BULLET;
				else if (!WeaponType.isAvailableDroneNotUse(oldType))
					this._droneWeapon = oldType;
				else
					this._droneWeapon = GameRule.DEFAULT_DRONE_WEAPON;
			}
			// If The Block is still carring,then throw without charge(WIP,maybe?)
		}

		protected dealUsingCD(): void {
			// trace(this.weapon.name,this._weaponChargeTime,this._weaponChargeMaxTime)
			if (this._weaponUsingCD > 0) {
				this._weaponUsingCD--;
				this._GUI.updateCD();
			}
			else {
				if (!this.weaponNeedsCharge) {
					if (this.isPress_Use)
						this.useWeapon();
				}
				else if (this._weaponChargeTime < 0) {
					this.initWeaponCharge();
				}
				else {
					if (this.weaponReverseCharge) {
						this.dealWeaponReverseCharge();
					}
					else if (this.isPress_Use) {
						this.dealWeaponCharge();
					}
				}
			}
		}

		protected dealWeaponCharge(): void {
			if (this._weaponChargeTime >= this._weaponChargeMaxTime) {
				this.useWeapon();
				this.resetCharge(false, false);
			}
			else
				this._weaponChargeTime++;
			this._GUI.updateCharge();
		}

		protected dealWeaponReverseCharge(): void {
			if (this.weaponChargeTime < this.weaponChargeMaxTime) {
				this._weaponChargeTime++;
			}
			if (this.isPress_Use) {
				this.useWeapon();
				this.resetCharge(false, false);
			}
			this._GUI.updateCharge();
		}

		protected onDisableCharge(): void {
			if (!this.weaponNeedsCharge || this._weaponUsingCD > 0 || !this.isActive || this.isRespawning)
				return;
			this.useWeapon();
			this.resetCharge();
		}

		public initWeaponCharge(): void {
			this._weaponChargeTime = 0;
			this._weaponChargeMaxTime = this._weapon.defaultChargeTime;
		}

		public resetCharge(includeMaxTime: boolean = true, updateGUI: boolean = true): void {
			this._weaponChargeTime = -1;
			if (includeMaxTime)
				this._weaponChargeMaxTime = 0;
			if (updateGUI)
				this._GUI.updateCharge();
		}

		public resetCD(): void {
			this._weaponUsingCD = 0;
			this._GUI.updateCD();
		}

		//====Functions About Attributes====//

		/**
		 * The Function returns the final damage with THIS PLAYER.
		 * FinalDamage=DefaultDamage+
		 * attacker.buffDamage*WeaponCoefficient-
		 * this.buffResistance*WeaponCoefficient>=0.
		 * @param	attacker	The attacker.
		 * @param	attackerWeapon	The attacker's weapon(null=attacker.weapon).
		 * @param	defaultDamage	The original damage by attacker.
		 * @return	The Final Damage.
		 */
		public final function computeFinalDamage(attacker: Player, attackerWeapon: WeaponType, defaultDamage: uint): uint {
			if (attacker == null)
				return attackerWeapon == null ? 0 : attackerWeapon.defaultDamage;
			if (attackerWeapon == null)
				attackerWeapon = attacker.weapon;
			if (attackerWeapon != null)
				return attackerWeapon.getBuffedDamage(defaultDamage, attacker.buffDamage, this.buffResistance);
			return 0;
		}

		public final function finalRemoveHealth(attacker: Player, attackerWeapon: WeaponType, defaultDamage: uint): void {
		this.removeHealth(this.computeFinalDamage(attacker, attackerWeapon, defaultDamage), attacker);
	}

		public final function computeFinalCD(weapon: WeaponType): uint {
		return weapon.getBuffedCD(this.buffCD);
	}

		public final function computeFinalRadius(defaultRadius: number): number {
		return defaultRadius * (1 + Math.min(this.buffRadius / 16, 3));
	}

		public final function computeFinalLightningEnergy(defaultEnergy: uint): int {
		return defaultEnergy * (1 + this._buffDamage / 20 + this._buffRadius / 10);

	}

	//====Functions About Graphics====//
	protected drawShape(Alpha: number = 1): void {
		var realRadiusX: number = (SIZE - LINE_SIZE) / 2;
		var realRadiusY: number = (SIZE - LINE_SIZE) / 2;
		graphics.clear();
		graphics.lineStyle(LINE_SIZE, this._lineColor);
		// graphics.beginFill(this._fillColor,Alpha);
		var m: Matrix = new Matrix();
		m.createGradientBox(GlobalGameVariables.DEFAULT_SIZE,
			GlobalGameVariables.DEFAULT_SIZE, 0, -realRadiusX, -realRadiusX);
		graphics.beginGradientFill(GradientType.LINEAR,
			[this._fillColor, this._fillColor2],
			[Alpha, Alpha],
			[63, 255],
			m,
			SpreadMethod.PAD,
			InterpolationMethod.RGB,
			1);
		graphics.moveTo(-realRadiusX, -realRadiusY);
		graphics.lineTo(realRadiusX, 0);
		graphics.lineTo(-realRadiusX, realRadiusY);
		graphics.lineTo(-realRadiusX, -realRadiusY);
		// graphics.drawCircle(0,0,10);
		graphics.endFill();
	}

	protected initColors(fillColor: number = NaN, lineColor: number = NaN): void {
		// Deal fillColor
		if(isNaN(fillColor))
	this._fillColor = this._team.defaultColor;
		else
	this._fillColor = uint(fillColor);
	// Deal lineColor
	var HSV: number[] = Color.HEXtoHSV(this._fillColor);
	this._fillColor2 = Color.HSVtoHEX(HSV[0], HSV[1], HSV[2] / 1.5);
	if (isNaN(lineColor)) {
		this._lineColor = Color.HSVtoHEX(HSV[0], HSV[1], HSV[2] / 2);
	}
	else
		this._lineColor = uint(lineColor);
}

	public setCarriedBlock(block: BlockCommon, copyBlock: boolean = true): void {
	if(block == null) {
	this._carriedBlock.visible = false;
}
		else {
	if (this._carriedBlock != null && this.contains(this._carriedBlock))
		this.removeChild(this._carriedBlock);
	this._carriedBlock = copyBlock ? block.clone() : block;
	this._carriedBlock.x = GlobalGameVariables.DEFAULT_SIZE / 2;
	this._carriedBlock.y = -GlobalGameVariables.DEFAULT_SIZE / 2;
	this._carriedBlock.alpha = CARRIED_BLOCK_ALPHA;
	this.addChild(this._carriedBlock);
}
	}

	protected addChildren(): void {
	this._host.playerGUIContainer.addChild(this._GUI);
}

		//====Tick Run Function====//
		public override function tickFunction(): void {
	this.dealUsingCD();
	this.updateKeyDelay();
	this.dealKeyContol();
	this.dealMoveInTest(this.entityX, this.entityY, false, false);
	this.dealHeal();
	super.tickFunction();
}

	//====Contol Functions====//
	public initContolKey(id: uint): void {
	switch(id) {
			// AI
			case 0:
	return;
	break;
	// P1
	case 1:
	contolKey_Up = KeyCode.W; // Up:W
	contolKey_Down = KeyCode.S; // Down:S
	contolKey_Left = KeyCode.A; // Left:A
	contolKey_Right = KeyCode.D; // Right:D
	contolKey_Use = KeyCode.SPACE; // Use:Space
	break;
	// P2
	case 2:
	contolKey_Up = KeyCode.UP; // Up:Key_UP
	contolKey_Down = KeyCode.DOWN; // Down:Key_DOWN
	contolKey_Left = KeyCode.LEFT; // Left:Key_Left
	contolKey_Right = KeyCode.RIGHT; // Right:Key_RIGHT
	contolKey_Use = KeyCode.NUMPAD_0; // Use:'0'
	break;
	// P3
	case 3:
	contolKey_Up = KeyCode.U; // Up:U
	contolKey_Down = KeyCode.J; // Down:J
	contolKey_Left = KeyCode.H; // Left:H
	contolKey_Right = KeyCode.K; // Right:K
	contolKey_Use = KeyCode.RIGHT_BRACKET; // Use:']'
	break;
	// P4
	case 4:
	contolKey_Up = KeyCode.NUMPAD_8; // Up:Num 5
	contolKey_Down = KeyCode.NUMPAD_5; // Down:Num 2
	contolKey_Left = KeyCode.NUMPAD_4; // Left:Num 1
	contolKey_Right = KeyCode.NUMPAD_6; // Right:Num 3
	contolKey_Use = KeyCode.NUMPAD_ADD; // Use:Num +
	break;
}
	}

	public isOwnContolKey(code: uint): boolean {
	return (code == this.contolKey_Up ||
		code == this.contolKey_Down ||
		code == this.contolKey_Left ||
		code == this.contolKey_Right ||
		code == this.contolKey_Use /*||
					code==this.contolKey_Select_Left||
					code==this.contolKey_Selec_Right*/);
}

	public isOwnKeyDown(code: uint): boolean {
	return (code == this.contolKey_Up && this.isPress_Up ||
		code == this.contolKey_Down && this.isPress_Down ||
		code == this.contolKey_Left && this.isPress_Left ||
		code == this.contolKey_Right && this.isPress_Right ||
		code == this.contolKey_Use && this.isPress_Use /*||
					code==this.contolKey_Select_Left||
					code==this.contolKey_Selec_Right*/);
}

	public clearContolKeys(): void {
	contolKey_Up = KeyCode.EMPTY;
	contolKey_Down = KeyCode.EMPTY;
	contolKey_Left = KeyCode.EMPTY;
	contolKey_Right = KeyCode.EMPTY;
	contolKey_Use = KeyCode.EMPTY;
}

	public turnAllKeyUp(): void {
	this.isPress_Up = false;
	this.isPress_Down = false;
	this.isPress_Left = false;
	this.isPress_Right = false;
	this.isPress_Use = false;
	// this.isPress_Select_Left=false;
	// this.isPress_Select_Right=false;
	this.keyDelay_Move = 0;
	this.contolDelay_Move = GlobalGameVariables.FIXED_TPS * 0.5;
	// this.contolDelay_Select=GlobalGameVariables.TPS/5;
	this.contolLoop_Move = GlobalGameVariables.FIXED_TPS * 0.05;
	// this.contolLoop_Select=GlobalGameVariables.TPS/40;
}

	public updateKeyDelay(): void {
	// trace(this.keyDelay_Move,this.contolDelay_Move,this.contolLoop_Move);
	//==Set==//
	// Move
	if(this.someMoveKeyDown) {
	this.keyDelay_Move++;
	if (this.keyDelay_Move >= this.contolLoop_Move) {
		this.keyDelay_Move = 0;
	}
}
		else {
	this.keyDelay_Move = -contolDelay_Move;
}
	}

	public runActionByKeyCode(code: uint): void {
	if(!this.isActive || this.isRespawning)
	return;
	switch(code) {
			case this.contolKey_Up:
	this.moveUp();
	break;
	case this.contolKey_Down:
	this.moveDown();
	break;
	case this.contolKey_Left:
	this.moveLeft();
	break;
	case this.contolKey_Right:
	this.moveRight();
	break;
	case this.contolKey_Use:
	if(!this.weaponReverseCharge)
	this.useWeapon();
	break;
	/*case this.contolKey_Select_Left:
	this.moveSelect_Left();
break;
case this.contolKey_Select_Right:
	this.moveSelect_Right();
break;*/
}
	}

	public dealKeyContol(): void {
	if(!this.isActive || this.isRespawning)
	return;
	if(this.someKeyDown) {
	// Move
	if (this.keyDelay_Move == 0) {
		// Up
		if (this.isPress_Up) {
			this.moveUp();
		}
		// Down
		else if (this.isPress_Down) {
			this.moveDown();
		}
		// Left
		else if (this.isPress_Left) {
			this.moveLeft();
		}
		// Right
		else if (this.isPress_Right) {
			this.moveRight();
		}
	} /*
				//Select_Left
				if(this.keyDelay_Select==0) {
					//Select_Right
					if(this.isPress_Select_Right) {
						this.SelectRight();
					}
					else if(this.isPress_Select_Left) {
						this.SelectLeft();
					}
				}*/
}
	}

		public override function moveForward(distance: number = 1): void {
	if (this.isRespawning)
		return;
	switch (this.rot) {
		case GlobalRot.RIGHT:
			moveRight();
			break;

		case GlobalRot.LEFT:
			moveLeft();
			break;

		case GlobalRot.UP:
			moveUp();
			break;

		case GlobalRot.DOWN:
			moveDown();
			break;

	}
}

		public override function moveIntForward(distance: number = 1): void {
	moveForward(distance);
}

	public moveLeft(): void {
	this._host.movePlayer(this, GlobalRot.LEFT, this.moveDistence);
}

	public moveRight(): void {
	this._host.movePlayer(this, GlobalRot.RIGHT, this.moveDistence);
}

	public moveUp(): void {
	this._host.movePlayer(this, GlobalRot.UP, this.moveDistence);
}

	public moveDown(): void {
	this._host.movePlayer(this, GlobalRot.DOWN, this.moveDistence);
}

	public turnUp(): void {
	this.rot = GlobalRot.UP;
}

	public turnDown(): void {
	this.rot = GlobalRot.DOWN;
}

	public turnAbsoluteLeft(): void {
	this.rot = GlobalRot.LEFT;
}

	public turnAbsoluteRight(): void {
	this.rot = GlobalRot.RIGHT;
}

	public turnBack(): void {
	this.rot += 2;
}

	public turnRelativeLeft(): void {
	this.rot += 3;
}

	public turnRelativeRight(): void {
	this.rot += 1;
}

	public useWeapon(): void {
	if(!this.weaponNeedsCharge || this.chargingPercent > 0) {
	this._host.playerUseWeapon(this, this.rot, this.chargingPercent);
}
if (this.weaponNeedsCharge)
	this._GUI.updateCharge();
	}
}
}
