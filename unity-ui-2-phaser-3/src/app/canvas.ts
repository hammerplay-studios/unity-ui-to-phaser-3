
import { Utils } from "./utils";
import App, { Point } from "../main";

export class Canvas extends Phaser.Scene {

    public canvasScaler: CanvasScaler;

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
    }

    public setCanvas(canvas: string) {
        var canvasData = this.cache.json.get(canvas);
        this.canvasScaler = new CanvasScaler(canvasData.canvasScaler);

        canvasData.images.forEach(uiImage => {
            var image = new UIImage(this, uiImage);
        });

        canvasData.texts.forEach(uiText => {
            var text = new UIText(this, uiText);
        });

        this.scale.on('resize', this.onResize.bind(this));
        this.onResize();
    }

    private onResize(gameSize?: any) {

        App.APP_WIDTH = this.scale.gameSize.width;
        App.APP_HEIGHT = this.scale.gameSize.height;

        let logWidth: number = Math.log2(App.APP_WIDTH / this.canvasScaler.referenceResolution.x);
        let logHeight: number = Math.log2(App.APP_HEIGHT / this.canvasScaler.referenceResolution.y);
        let logWeightedAverage: number = Utils.Lerp(logWidth, logHeight, this.canvasScaler.match);
        let scaleFactor: number = Math.pow(2, logWeightedAverage);

        this.children.list.forEach(child => {
            if (child instanceof UIImage || child instanceof UIText) {
                child.applyScale(scaleFactor);
                child.update();
            }
        });
    }
}

class CanvasScaler {
    public match: number;
    public referenceResolution: Point;

    constructor(canvasScaler?: any) {
        if (canvasScaler) {
            this.match = canvasScaler.match;
            this.referenceResolution = new Point(canvasScaler.referenceResolution.x, canvasScaler.referenceResolution.y);
        }
    }
}

export default class TestImage extends Phaser.GameObjects.Sprite {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | integer) {
        super(scene, x, y, texture, frame);
    }
}

export class UIImage extends Phaser.GameObjects.Sprite {
    public anchorMin: Point;
    public anchorMax: Point;
    public parent: UIImage;
    public scaleFactor: Point;
    public anchoredPosition: Point;

    public childrenImages: Array<UIImage>;
    public childrenTexts: Array<UIText>;

    constructor(scene: Phaser.Scene, uiImage?: any) {
        super(scene, 300, 300, 'game-ui', uiImage.spriteName + '.png');

        this.parent = scene.children.getByName(uiImage.parentName) as UIImage;
        if (this.parent instanceof UIImage) {
            if (this.parent.childrenImages == null) {
                this.parent.childrenImages = new Array<UIImage>();
            }
            this.parent.childrenImages.push(this);
        }

        this.name = uiImage.name;
        if (this.name.includes('Button')) {
            this.setInteractive();
        }
        this.setOrigin(uiImage.pivot.x, uiImage.pivot.y).setScrollFactor(0);

        this.anchorMin = new Point(uiImage.anchorMin.x, uiImage.anchorMin.y);
        this.anchorMax = new Point(uiImage.anchorMax.x, uiImage.anchorMax.y);
        this.scaleFactor = new Point(uiImage.scaleFactor.x, uiImage.scaleFactor.y);
        this.anchoredPosition = new Point(uiImage.anchoredPosition.x, uiImage.anchoredPosition.y);

        this.tint = parseInt('0x' + uiImage.tint);
        this.alpha = uiImage.alpha;

        scene.add.existing(this);

        this.update();

    }

    public update() {
        var position = null;
        if (this.parent == null) {
            position = App.ViewportToAppView(this.anchorMax)
        } else {
            position = this.parent.viewportToBounds(this.anchorMax);
        }

        this.x = position.x + (this.anchoredPosition.x * this._scale);
        this.y = position.y + (this.anchoredPosition.y * this._scale);
    }

    public setScaleFactor(scaleFactor: number) {
        this.scaleFactor.x = scaleFactor;
        this.scaleFactor.y = scaleFactor;

        this.applyScale(this._scale);

        if (this.childrenImages != null) {
            this.childrenImages.forEach(element => {
                
                element.setScaleFactor(scaleFactor);
            });
        }
    }

    private _scale: number;

    public applyScale(scale: number) {

        this._scale = scale;
        this.scaleX = this.scaleFactor.x * scale * ((this.parent != null) ? this.parent.scaleFactor.x : 1);
        this.scaleY = this.scaleFactor.y * scale * ((this.parent != null) ? this.parent.scaleFactor.y : 1);
    }

    public viewportToBounds(viewportPoint: Point): Point {
        var bounds = this.getBounds();
        return new Point(

            Utils.Interpolate(viewportPoint.x, 0, 1, bounds.left, bounds.right),
            Utils.Interpolate(viewportPoint.y, 0, 1, bounds.top, bounds.bottom),
        );
    }

    public getChildImageByName(name: string): UIImage {
        return this.childrenImages.find(uiImage => uiImage.name == name);
    }

    public getChildTextByName(name: string): UIText {
        return this.childrenTexts.find(uiText => uiText.name == name);
    }
}

export class UIText extends Phaser.GameObjects.Text {
    public anchorMin: Point;
    public anchorMax: Point;
    public parent: UIImage;
    public scaleFactor: Point;
    public anchoredPosition: Point;
    //public anch

    constructor(scene: Phaser.Scene, uiText?: any) {
        super(scene, 300, 300, uiText.text,
            {
                'fontSize': uiText.fontSize + 'px',
                'fontFamily': uiText.fontName,
                'wordWrap': { width: uiText.size.x, useAdvancedWrap: true }
            });

        this.setAlign(this.alignment(uiText.align));

        this.name = uiText.name;
        this.parent = scene.children.getByName(uiText.parentName) as UIImage;
        if (this.parent instanceof UIImage) {
            if (this.parent.childrenTexts == null) {
                this.parent.childrenTexts = new Array<UIText>();
            }
            this.parent.childrenTexts.push(this);
        }

        this.setFixedSize(uiText.size.x, 0);

        this.setOrigin(uiText.pivot.x, uiText.pivot.y).setScrollFactor(0);

        this.anchorMin = new Point(uiText.anchorMin.x, uiText.anchorMin.y);
        this.anchorMax = new Point(uiText.anchorMax.x, uiText.anchorMax.y);
        this.scaleFactor = new Point(uiText.scaleFactor.x, uiText.scaleFactor.y);
        this.anchoredPosition = new Point(uiText.anchoredPosition.x, uiText.anchoredPosition.y);

        this.tint = parseInt('0x' + uiText.tint);
        this.alpha = uiText.alpha;

        scene.add.existing(this);
    }

    private alignment(align: string) {
        if (align.includes('Left'))
            return 'left';
        else if (align.includes('Right'))
            return 'right'

        return 'center';
    }

    public update() {
        var position = null;

        if (this.parent == null) {
            position = App.ViewportToAppView(this.anchorMax)
        } else {
            position = this.parent.viewportToBounds(this.anchorMax);
        }

        this.x = position.x + (this.anchoredPosition.x * this._scale);
        this.y = position.y + (this.anchoredPosition.y * this._scale);
    }

    private _scale: number;
    public applyScale(scale: number) {
        this._scale = scale;
        this.scaleX = this.scaleFactor.x * scale * ((this.parent != null) ? this.parent.scaleFactor.x : 1);
        this.scaleY = this.scaleFactor.y * scale * ((this.parent != null) ? this.parent.scaleFactor.y : 1);
    }

    public viewportToBounds(viewportPoint: Point): Point {
        var bounds = this.getBounds();
        return new Point(

            Utils.Interpolate(viewportPoint.x, 0, 1, bounds.left, bounds.right),
            Utils.Interpolate(viewportPoint.y, 0, 1, bounds.top, bounds.bottom),
        );
    }
}

