function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

var rfarm = {
    apiKey: "75f5-4d53-b0f4",
    workspace: "55a0bd33-9f15-4bc0-a482-17899eb67af3",
    baseUrl: "https://alengo3d.renderfarmjs.com:8000",
    // baseUrl: "https://localhost:8000",

    geometries: {},  // here we map scene geometry uuid <==> backend geometry resource
    materials: {},   // here we map scene material uuid <==> backend material resource

    nodes: {},       // here we map scene nodes         <==> backend nodes
    sessionId: null,  // current session

    // node constructor, maps threejs node ref to 3ds max node name
    _rfarmNode: function(threeNodeRef, maxNodeName) {
        return {
            threeNodeRef: threeNodeRef,
            maxNodeName: maxNodeName
        };
    }
};

// public
rfarm.createSession = function(onCreated, onError) {
    console.log("Requesting new session...");

    $.ajax({
        url: this.baseUrl  + "/v1/session",
        data: { 
            api_key: this.apiKey, 
            workspace_guid: this.workspace,
            scene_filename: "test1_cubes.max"
        },
        type: 'POST',
        success: function(result) {
            this.sessionId = result.data.guid;
            if (onCreated) onCreated(result.data);
        }.bind(this),
        error: function(err) {
            console.error(err.responseJSON);
            if (onError) onError(err.responseJSON);
        }.bind(this)
    });

}.bind(rfarm);

// public
rfarm.closeSession = function(sessionGuid, onClosed) {
    console.log("Closing session...");

    $.ajax({
        url: this.baseUrl  + "/v1/session/" + sessionGuid,
        data: { },
        type: 'DELETE',
        success: function(result) {
            if (onClosed) onClosed(result);
        }.bind(this),
        error: function(err) {
            console.error(err.responseJSON);
            console.error(err);
        }.bind(this)
    }).done(function(data) {                
        console.log("complete");
    });
}.bind(rfarm);

// public
rfarm.createScene = function(sceneObj, onComplete) {
    console.log("Creating new scene...");

    $.ajax({
        url: this.baseUrl  + "/scene",
        data: {
            session: this.sessionId
        },
        type: 'POST',
        success: function(result) {
            console.log(result);

            let sceneRootNodeName = result.id;
            this.nodes[ sceneObj.uuid ] = new rfarm._rfarmNode(sceneObj, sceneRootNodeName);

            if (onComplete) onComplete(result.id);
        }.bind(this),
        error: function(err) {
            console.error(err.responseJSON);
        }.bind(this)
    });
}.bind(rfarm);

rfarm.openScene = function(sceneObj, maxSceneFilename, onComplete) {
    console.log("Opening scene from workspace...");

    $.ajax({
        url: this.baseUrl  + "/scene",
        data: {
            scene_filename: maxSceneFilename,
            session: this.sessionId
        },
        type: 'POST',
        success: function(result) {
            console.log(result);

            let sceneRootNodeName = result.id;
            this.nodes[ sceneObj.uuid ] = new rfarm._rfarmNode(sceneObj, sceneRootNodeName);

            if (onComplete) onComplete(result.id);
        }.bind(this),
        error: function(err) {
            console.error(err.responseJSON);
        }.bind(this)
    });
}.bind(rfarm);

// public
rfarm.createMesh = function(obj, onComplete) {
    if (obj.type === "Mesh") {
        this._postGeometry( obj.geometry, function(geometryName) {
            this._postMaterial( obj.material, function(materialName) {
                this._getMaxNodeName( obj.parent, function(parentName) {
                    obj.updateMatrixWorld (true);
                    this._postMesh(parentName, geometryName, materialName, obj.matrixWorld.elements, function(nodeName) {
                        // 3ds max object may be renamed when it was added to scene
                        this.geometries[ obj.geometry.uuid ].maxNodeName = nodeName;

                        this.nodes[ obj.uuid ] = new rfarm._rfarmNode(obj, nodeName);
                        console.log("client nodes: ", this.nodes);
                        onComplete(nodeName);
                    }.bind(this));
                }.bind(this) )
            }.bind(this) );
        }.bind(this) );
    }
}.bind(rfarm);

//public
rfarm.createCamera = function(camera, onCameraReady) {
    console.log("Creating new camera...");

    camera.updateMatrix();
    camera.updateMatrixWorld (true);
    camera.updateProjectionMatrix();

    var cameraJson = camera.toJSON();
    console.log("CAMERA: ", cameraJson);
    var cameraText = JSON.stringify(cameraJson);
    var compressedCameraData = LZString144.compressToBase64(cameraText);

    $.ajax({
        url: this.baseUrl  + "/scene/0/camera",
        data: { 
            session: this.sessionId,
            camera: compressedCameraData 
        },
        type: 'POST',
        success: function(result) {
            console.log(result);
            onCameraReady(result.id);
        }.bind(this),
        error: function(err) {
            console.error(err.responseJSON);
        }.bind(this)
    });

}.bind(rfarm);

//public
rfarm.createSkylight = function(onCreated) {
    console.log("Creating new skylight...");

    $.ajax({
        url: this.baseUrl  + "/scene/0/skylight",
        data: { 
            session: this.sessionId, 
        },
        type: 'POST',
        success: function(result) {
            console.log(result);
            if (onCreated) onCreated();
        }.bind(this),
        error: function(err) {
            console.error(err.responseJSON);
        }.bind(this)
    });
}.bind(rfarm);

//public
rfarm.createSpotlight = function(spotlight, spotlightTarget, onCreated) {
    console.log("Creating new spotlight...");

    spotlight.updateMatrix();
    spotlight.updateMatrixWorld (true);

    spotlightTarget.updateMatrix();
    spotlightTarget.updateMatrixWorld (true);

    var spotlightJson = spotlight.toJSON();
    spotlightJson.object.target = spotlightTarget.matrixWorld.elements;
    var spotlightText = JSON.stringify(spotlightJson.object);
    var compressedSpotlightData = LZString144.compressToBase64(spotlightText);

    $.ajax({
        url: this.baseUrl  + "/scene/0/spotlight",
        data: { 
            session: this.sessionId,
            spotlight: compressedSpotlightData
        },
        type: 'POST',
        success: function(result) {
            console.log(result);
            if (onCreated) onCreated();
        }.bind(this),
        error: function(err) {
            console.error(err.responseJSON);
        }.bind(this)
    });
}.bind(rfarm);

//public
rfarm.createJob = function(sessionGuid, cameraName, bakeMeshUuid, width, height, renderSettings, onStarted) {
    console.log("Creating new render job...");

    $.ajax({
        url: rfarm.baseUrl  + "/v1/job",
        data: { 
            session_guid: sessionGuid,
            camera_name: cameraName,
            // bake_mesh_uuid: bakeMeshUuid,
            render_width: width,
            render_height: height,
            render_settings: renderSettings,
        },
        type: 'POST',
        success: function(result) {
            console.log(result);
            onStarted(result.data);
        }.bind(this),
        error: function(err) {
            console.error(err.responseJSON);
        }.bind(this)
    });
}

//public
rfarm.getJob = function(jobGuid, callback) {
    $.ajax({
        url: rfarm.baseUrl  + "/v1/job/" + jobGuid,
        data: { },
        type: 'GET',
        success: function(result) {
            console.log(result);
            callback(result.data);
        }.bind(this),
        error: function(err) {
            console.error(err.responseJSON);
        }.bind(this)
    });
}

//public
rfarm.render = function(cameraName, width, height, onStarted, onProgress, onImageReady) {
    console.log("Creating new render job...");

    var checkJobStatus = function(guid) {
        $.ajax({
            url: this.baseUrl  + "/job/" + guid,
            type: 'GET',
            success: function(result) {
                console.log(result);
                if (result.status === "rendering") {
                    if (result.elapsed > 0) {
                        onProgress(result.vrayProgress, result.elapsed);
                    }

                    setTimeout(function() {
                        checkJobStatus(guid);
                    }, 1000);

                } else if (result.status === "succeeded") {
                    onImageReady(result.url);
                }
            }.bind(this),
            error: function(err) {
                console.error(err.responseJSON);
            }.bind(this)
        });
    }.bind(this);

    $.ajax({
        url: this.baseUrl  + "/job",
        data: { 
            session: this.sessionId,
            width: width, 
            height: height, 
            camera: cameraName,
            progressiveMaxRenderTime: 2.5,
            progressiveNoiseThreshold: 0.001
        },
        type: 'POST',
        success: function(result) {
            console.log(result);
            onStarted(result.guid);
            checkJobStatus(result.guid);
        }.bind(this),
        error: function(err) {
            console.error(err.responseJSON);
        }.bind(this)
    });
}.bind(rfarm);

//public
rfarm.cancelRender = function(jobGuid, onCanceled) {
    console.log("Cancelling job...");

    $.ajax({
        url: this.baseUrl  + "/job/" + jobGuid,
        data: { 
            status: "canceled"
        },
        type: 'PUT',
        success: function(result) {
            console.log(result);
            onCanceled(result);
        }.bind(this),
        error: function(err) {
            console.error(err.responseJSON);
        }.bind(this)
    });
}.bind(rfarm);

rfarm.postScene = function(sessionGuid, sceneJson, onComplete) {
    var sceneText = JSON.stringify(sceneJson);
    var compressedSceneData = LZString.compressToBase64(sceneText);

    $.ajax({
        url: this.baseUrl  + "/v1/three",
        data: { 
            session_guid: sessionGuid,
            compressed_json: compressedSceneData
        },
        type: 'POST',
        success: function(result) {
            onComplete(result);
        },
        error: function(err) {
            console.error(err.responseJSON);
        }
    });

}.bind(rfarm);

rfarm.putCamera = function(sessionGuid, cameraJson, onComplete) {
    var cameraText = JSON.stringify(cameraJson);
    var compressedCameraData = LZString.compressToBase64(cameraText);

    $.ajax({
        url: this.baseUrl  + "/v1/three/" + cameraJson.object.uuid,
        data: { 
            session_guid: sessionGuid,
            compressed_json: compressedCameraData
        },
        type: 'PUT',
        success: function(result) {
            onComplete(result);
        },
        error: function(err) {
            console.error(err.responseJSON);
        }
    });

}.bind(rfarm);

rfarm.postGeometries = function(sessionGuid, geometryJson, onComplete) {
    console.log("Posting geometries: " + geometryJson);

    var geometryText = JSON.stringify(geometryJson);
    var compressedGeometryData = LZString.compressToBase64(geometryText);

    $.ajax({
        url: this.baseUrl  + "/v1/three/geometry",
        data: { 
            session_guid: sessionGuid,
            compressed_json: compressedGeometryData,
            generate_uv2: false
        },
        type: 'POST',
        success: function(result) {
            console.log(result);
            if (onComplete) onComplete();
        }.bind(this),
        error: function(err) {
            console.error(err.responseJSON);
        }.bind(this)
    });

}.bind(rfarm);

rfarm.postMaterials = function(sessionGuid, materialJson, onComplete) {
    console.log("Posting materials: " + materialJson);

    var materialText = JSON.stringify(materialJson);
    var compressedMaterialData = LZString.compressToBase64(materialText);

    $.ajax({
        url: this.baseUrl  + "/v1/three/material",
        data: {
            session_guid: sessionGuid,
            compressed_json: compressedMaterialData,
        },
        type: 'POST',
        success: function(result) {
            console.log(result);
            if (onComplete) onComplete();
        }.bind(this),
        error: function(err) {
            console.error(err.responseJSON);
        }.bind(this)
    });
}.bind(rfarm);

rfarm._getMaxNodeName = function(threeNodeRef, onComplete) {
    // returns node name in 3ds max by given threejs node ref
    if (this.nodes[ threeNodeRef.uuid ] !== undefined) {
        onComplete( this.nodes[ threeNodeRef.uuid ].maxNodeName );
    }
}.bind(rfarm);

rfarm._postMesh = function(parentName, geometryName, materialName, matrixWorldArray, onComplete) {
    console.log("Creating new node...");

    var matrixText = JSON.stringify(matrixWorldArray);
    var compressedMatrixData = LZString144.compressToBase64(matrixText);

    $.ajax({
        url: this.baseUrl  + "/scene/0/mesh",
        data: { 
            session: this.sessionId,
            parentName: parentName,
            geometryName: geometryName,
            materialName: materialName,
            matrixWorld: compressedMatrixData
        },
        type: 'POST',
        success: function(result) {
            console.log(result);
            if (onComplete) onComplete(result.id);
        }.bind(this),
        error: function(err) {
            console.error(err.responseJSON);
        }.bind(this)
    });
}.bind(rfarm);
