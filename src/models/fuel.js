import Phaser from 'phaser'

export default class Fuel extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture)

        scene.add.existing(this)
        scene.physics.add.existing(this)
        scene.physics.add.collider(this, scene.platforms)

        this.setInteractive()
    }
}
