import Phaser from "phaser";

export default class Statics
{
    static Rectangle = Phaser.Geom.Rectangle
    static RectangleToRectangle = Phaser.Geom.Intersects.RectangleToRectangle
    static GetRectangleIntersection = Phaser.Geom.Intersects.GetRectangleIntersection
    static GetBounds = Phaser.Display.Bounds.GetBounds
    static rect1 = new Statics.Rectangle()
    static rect2 = new Statics.Rectangle()
    static rect3 = new Statics.Rectangle()
    static rect4 = new Statics.Rectangle()
    static rect5 = new Statics.Rectangle()
    static rect6 = new Statics.Rectangle()
    static rect7 = new Statics.Rectangle()
    static rect8 = new Statics.Rectangle()
    static rect9 = new Statics.Rectangle()
    static rect10 = new Statics.Rectangle()
    static rect11 = new Statics.Rectangle()
    static rect12 = new Statics.Rectangle()
    static overlap = new Statics.Rectangle()

    static randomizedDecision()
    {
        return Math.random() > 0.5;
    }

    static random(min, max)
    {
        return Phaser.Math.Between(min, max);
    }
}
