import { int, uint } from "../../legacy/AS3Legacy";

/**
 * Use for manage entries in game.
 */
export default class CommonSystem<T> {
	//============Static variables============//

	//============Instance variables============//

	// UUID

	/**
	 * The list of entry also uses to represent UUIDs for entries,
	 * the UUID for every entry is just its unique immutable index 
	 * 
	 * Remove an entry will ony `delete` the reference and change it to `undefined`
	 */
	protected _entries: T[];

	public reuseUUID: boolean = false;

	//============Constructor & Destructor============//
	public constructor(...entries: T[]) {
		this._entries = [...entries];
	}

	//============Destructor Function============//
	public destructor(): void {
		this.clear();
		this._entries = [];
	}

	//============Instance Getters And Setters============//

	public get entries(): T[] {
		return this._entries;
	}

	protected _temp_numEntries = 0;
	/**
	 * Return the count of valid entries.
	 * 
	 * ! Not the length of its inner array at all. 
	 * 
	 * * Uses temp variables to improve performance
	 */
	public get numEntries(): uint {
		return this._temp_numEntries;
	}

	//============Instance Functions============//
	// UUID About //

	public isEmptyUUID(uuid: uint): boolean {
		return this._entries[uuid] === undefined;
	}

	public isValidUUID(uuid: uint): boolean {
		return this._entries[uuid] !== undefined;
	}

	/**
	 * 
	 * @returns the next UUID `i` when `this.getByUUID(i) === undefined`
	 */
	public nextEmptyUUID(): uint {
		if (this.reuseUUID) {
			let i: uint = 0;
			if (this.isEmptyUUID(i))
				return i;
			// if the first isn't
			while (!this.isEmptyUUID(++i));
			return i;
		}
		else
			return this._entries.length
	}

	public getByUUID(uuid: uint): T {
		return this._entries[uuid];
	}

	public indexOf(Entry: T): uint {
		return this._entries.indexOf(Entry);
	}

	public hasValidUUID(Entry: T): boolean {
		return this._entries.indexOf(Entry) !== -1;
	}

	public getAllEntry(): T[] {
		let result: T[] = new Array<T>();
		for (let obj of this._entries)
			if (obj !== undefined)
				result.push(obj as T);
		return result;
	}

	public get allValidUUID(): uint[] {
		let result: uint[] = [];
		for (let i: uint = 0; i < this._entries.length; i++)
			if (this.isValidUUID(i))
				result.push(i);
		return result;
	}

	public register(Entry: T): CommonSystem<T> {
		let newUUID: uint = this.nextEmptyUUID();
		this._entries[newUUID] = Entry;
		this._temp_numEntries++;
		return this;
	}

	public registerAt(Entry: T): CommonSystem<T> {
		let newUUID: uint = this.nextEmptyUUID();
		this._entries[newUUID] = Entry;
		this._temp_numEntries++;
		return this;
	}

	public remove(Entry: T): boolean {
		let uuid: uint = this.indexOf(Entry);
		if (uuid > 0)
			return this.removeAt(uuid);
		return false;
	}

	public removeAt(uuid: number): boolean {
		delete this._entries[uuid];
		this._temp_numEntries--;
		return true;
	}

	/**
	 * Remove All Entry!
	 */
	public clear(): void {
		for (let i: uint = 0; i < this._entries.length; i++)
			delete this._entries[i];
		this._temp_numEntries = 0;
	}

	/**
	 * Slice all empty UUIDs
	 * 
	 * ! May change the current entities's UUID
	 */
	public GC(): void {
		for (let i = this._entries.length - 1; i >= 0; i--)
			if (this.isEmptyUUID(i))
				this._entries.slice(i, 1);
	}
}