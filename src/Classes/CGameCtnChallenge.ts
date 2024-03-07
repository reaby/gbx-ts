enum MapKind {
	EndMarker,
	Campaign,
	Puzzle,
	Retro,
	TimeAttack,
	Rounds,
	InProgress,
	Campaign_7,
	Multi,
	Solo,
	Site,
	SoloNadeo,
	MultiNadeo,
}

/**
 * Chunk 0x03043000
 */
export default class CGameCtnChallenge {
	static 0x00d: Chunk = (r) => {
		const playerModel = r.readMeta();

		return { playerModel };
	};

	static 0x011: Chunk = (r) => {
		const blockStock = r.readNodeReference(); // CGameCtnCollectorList
		const challengeParameters = r.readNodeReference(); // CGameCtnChallengeParameters
		const mapKind = r.readUInt32() as MapKind;

		return {
			blockStock,
			challengeParameters,
			mapKind,
		};
	};

	static 0x01f: Chunk = (r) => {
		let blocks = [];

		const mapInfo = r.readMeta();
		const mapName = r.readString();
		const decoration = r.readMeta();

		const size = [r.readUInt32(), r.readUInt32(), r.readUInt32()];

		const needUnlock = r.readBoolean();

		const version = r.readUInt32();
		const nbBlocks = r.readUInt32();

		const readBlock = (): boolean => {
			const blockName = r.readLookbackString();
			const rotation = r.readByte();

			// Unimplemented: There is some special cases for the coordinates in version >= 6
			const position = {
				x: r.readByte(),
				y: r.readByte(),
				z: r.readByte(),
			};

			let flags: number;

			if (version == 0) flags = r.readUInt16();
			else if (version > 0) flags = r.readUInt32();

			if (flags == 0xffffffff) {
				blocks.push({
					blockName,
					rotation,
					position,
				});

				return false;
			}

			let author: string, skin: object, blockParameters: object;

			if ((flags & 0x8000) != 0) {
				author = r.readLookbackString();
				skin = r.readNodeReference(); // CGameCtnBlockSkin
			}

			if (flags & 0x100000) {
				blockParameters = r.readNodeReference(); // CGameWaypointSpecialProperty
			}

			blocks.push({
				blockName,
				rotation,
				position,
				author,
				skin,
				blockParameters,
			});

			return true;
		};

		for (let i = 0; i < nbBlocks; i++) {
			const isNormal = readBlock();

			if (isNormal) continue;
			else i--;
		}

		// Peek ahead to see if there is any more blocks
		while ((r.peekUInt32() & 0xc0000000) > 0) {
			readBlock();
		}

		return {
			mapInfo,
			mapName,
			decoration,
			size,
			needUnlock,
			blocks,
		};
	};

	static 0x022: Chunk = (r) => {
		const u01 = r.readUInt32();

		return null;
	};

	static 0x024: Chunk = (r) => {
		const customMusicPackDesc = r.readFileReference();

		return { customMusicPackDesc };
	};

	static 0x025: Chunk = (r) => {
		const mapCoordOrigin = [r.readUInt32(), r.readUInt32()];
		const mapCoordTarget = [r.readUInt32(), r.readUInt32()];

		return {
			mapCoordOrigin,
			mapCoordTarget,
		};
	};

	static 0x026: Chunk = (r) => {
		const clipGlobal = r.readNodeReference(); // Empty

		return { clipGlobal };
	};

	static 0x028: Chunk = (r) => {
		const hasCustomCamThumbnail = r.readBoolean();

		if (!hasCustomCamThumbnail) {
			const comments = r.readString();

			return {
				hasCustomCamThumbnail,
				comments,
			};
		}

		const u01 = r.readByte();
		const u02 = [r.readUInt32(), r.readUInt32(), r.readUInt32()];
		const u03 = [r.readUInt32(), r.readUInt32(), r.readUInt32()];
		const u04 = [r.readUInt32(), r.readUInt32(), r.readUInt32()];
		const thumbnailPosition = [r.readUInt32(), r.readUInt32(), r.readUInt32()];
		const thumbnailFov = r.readUInt32();
		const thumbnailNearClipPlane = r.readUInt32();
		const thumbnailFarClipPlane = r.readUInt32();

		const comments = r.readString();

		return {
			hasCustomCamThumbnail,
			thumbnailPosition,
			thumbnailFov,
			thumbnailNearClipPlane,
			thumbnailFarClipPlane,
			comments,
		};
	};

	static 0x02a: Chunk = (r) => {
		const u01 = r.readBoolean();

		return null;
	};

	static 0x049: Chunk = (r, fullChunkId) => {
		r.forceChunkSkip(fullChunkId);

		return null;
	};
}
