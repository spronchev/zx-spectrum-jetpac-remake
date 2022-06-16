import Phaser from 'phaser'

export default class Laser extends Phaser.GameObjects.Sprite {
    constructor(scene) {
        super(scene, 0, 0, 'beam');

        scene.add.existing(this);
        scene.lasers.add(this);

        this.incX = 0;
        this.incY = 0;
        this.lifespan = 0;

        this.speed = Phaser.Math.GetSpeed(1000, 1);
    }

    fire(x, y, turnedLeft, player)
    {
        const angle = Phaser.Math.Angle.Between(x, y, player.x, player.y);

        this.setActive(true);
        this.setVisible(true);
        this.setRotation(angle);


        if(turnedLeft)
        {
            this.incX = Math.cos(0);
            this.setPosition(player.x - 100, player.y - 10);

        } else {
            this.incX = Math.cos(-160);
            this.setPosition(player.x + 100, player.y - 10);
        }

        this.incY = Math.sin(angle);
        this.lifespan = 550;
    }

    update (time, delta)
    {
        this.lifespan -= delta;

        this.x -= this.incX * (this.speed * delta);
        this.y -= this.incY * (this.speed * delta);

        if (this.lifespan <= 0)
        {
            this.destroy();
        }
    }
}
