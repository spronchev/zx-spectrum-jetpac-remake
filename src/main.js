import Phaser from 'phaser'

import GameScene from "./scenes/GameScene"
import TitleScene from "./scenes/TitleScene"

const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 400 },
			debug: false,
		}
	},
	scene: [TitleScene, GameScene]
}

export default new Phaser.Game(config)
