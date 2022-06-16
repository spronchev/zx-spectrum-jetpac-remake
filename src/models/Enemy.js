import Phaser from "phaser";

export default class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture)

        this.setInteractive()
    }
}
