import Phaser from 'phaser'

import GameScene from "./scenes/gameScene"
import TitleScene from "./scenes/titleScene"

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
