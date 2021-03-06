import { ISceneObjectBinding, IMaxscriptClient, IGeometryCache, IMaterialCache, IImageCache, ITextureCache } from "../../interfaces";
import { Workspace } from "../../database/model/workspace";
import uuidv4 = require("uuid/v4");

export abstract class SceneObjectBindingBase implements ISceneObjectBinding {
    protected _maxscriptClient: IMaxscriptClient;
    protected _geometryCache: IGeometryCache;
    protected _materialCache: IMaterialCache;
    protected _textureCache: ITextureCache;
    protected _imageCache: IImageCache;
    protected _workspace: Workspace;

    protected _objectJson: any;

    protected _maxName: string;
    protected _maxParentName: string;

    public constructor(
        maxscriptClient: IMaxscriptClient,
        geometryCache?: IGeometryCache,
        materialCache?: IMaterialCache,
        textureCache?: ITextureCache,
        imageCache?: IImageCache,
        workspace?: Workspace,
    ) {
        this._maxscriptClient = maxscriptClient;
        this._geometryCache = geometryCache;
        this._materialCache = materialCache;
        this._textureCache = textureCache;
        this._imageCache = imageCache;
        this._workspace = workspace;
    }

    public abstract Get(): Promise<any>;
    public abstract Post(objectJson: any, parent: any): Promise<any>;
    public abstract Put(objectJson: any): Promise<any>;
    public abstract Delete(): Promise<any>;

    protected getObjectName(obj: any): string {
        let parts = (obj.uuid || uuidv4()).split("-");

        if (obj.name) {
            let safeName = obj.name.replace(/\W/g, '');
            if (safeName) {
                return `${safeName}_${parts[0]}`;
            }
        }

        return `${obj.type}_${parts[0]}`;
    }
}
