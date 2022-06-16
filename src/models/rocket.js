import Phaser from 'phaser'

export default class Rocket extends Phaser.GameObjects.Sprite
{
    constructor(scene, x, y, texture)
    {
        super(scene, x, y, texture)

        scene.add.existing(this)
        scene.physics.add.existing(this)
        scene.physics.add.collider(this, scene.platforms)

        this.setInteractive()
        this.body.setBounce(0, 0)
        this.body.setVelocityY(0)
        this.body.setVelocityX(0)
        this.body.pushable = false
    }
}
