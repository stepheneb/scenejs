/**
 * Backend for a scene node.
 *  @private
 */
SceneJS._sceneModule = new (function() {

    var initialised = false; // True as soon as first scene registered
    var scenes = {};
    var nScenes = 0;
    var activeSceneId;

    var projMat;
    var viewMat;

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.RESET,
            function() {
                scenes = {};
                nScenes = 0;
                activeSceneId = null;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.PROJECTION_TRANSFORM_UPDATED,
            function(params) {
                projMat = params.matrix;
            });

    SceneJS._eventModule.addListener(
            SceneJS._eventModule.VIEW_TRANSFORM_UPDATED,
            function(params) {
                viewMat = params.matrix;
            });

    /** Locates element in DOM to write logging to
     * @private
     */
    function findLoggingElement(loggingElementId) {
        var element;
        if (!loggingElementId) {
            element = document.getElementById(SceneJS.Scene.DEFAULT_LOGGING_ELEMENT_ID);
            if (!element) {
                SceneJS._loggingModule.info("SceneJS.Scene config 'loggingElementId' omitted and failed to find default logging element with ID '"
                        + SceneJS.Scene.DEFAULT_LOGGING_ELEMENT_ID + "' - that's OK, logging to browser console instead");
            }
        } else {
            element = document.getElementById(loggingElementId);
            if (!element) {
                element = document.getElementById(SceneJS.Scene.DEFAULT_LOGGING_ELEMENT_ID);
                if (!element) {
                    SceneJS._loggingModule.info("SceneJS.Scene config 'loggingElementId' unresolved and failed to find default logging element with ID '"
                            + SceneJS.Scene.DEFAULT_LOGGING_ELEMENT_ID + "' - that's OK, logging to browser console instead");
                } else {
                    SceneJS._loggingModule.info("SceneJS.Scene config 'loggingElementId' unresolved - found default logging element with ID '"
                            + SceneJS.Scene.DEFAULT_LOGGING_ELEMENT_ID + "' - logging to browser console also");
                }
            } else {
                SceneJS._loggingModule.info("SceneJS.Scene logging to element with ID '"
                        + loggingElementId + "' - logging to browser console also");
            }
        }
        return element;
    }

    /** Locates canvas in DOM, finds WebGL context on it,
     *  sets some default state on the context, then returns
     *  canvas, canvas ID and context wrapped up in an object.
     *
     * If canvasId is null, will fall back on SceneJS.Scene.DEFAULT_CANVAS_ID
     * @private
     */
    function findCanvas(canvasId) {
        var canvas;
        if (!canvasId) {
            SceneJS._loggingModule.info("SceneJS.Scene config 'canvasId' omitted - looking for default canvas with ID '"
                    + SceneJS.Scene.DEFAULT_CANVAS_ID + "'");
            canvasId = SceneJS.Scene.DEFAULT_CANVAS_ID;
            canvas = document.getElementById(canvasId);
            if (!canvas) {
                throw SceneJS._errorModule.fatalError(new SceneJS.errors.CanvasNotFoundException
                        ("SceneJS.Scene failed to find default canvas with ID '"
                                + SceneJS.Scene.DEFAULT_CANVAS_ID + "'"));
            }
        } else {
            canvas = document.getElementById(canvasId);
            if (canvas) {
                SceneJS._loggingModule.info("SceneJS.Scene binding to canvas '" + canvasId + "'");
            } else {
                SceneJS._loggingModule.info("SceneJS.Scene config 'canvasId' unresolved - looking for default canvas with " +
                                            "ID '" + SceneJS.Scene.DEFAULT_CANVAS_ID + "'");
                canvasId = SceneJS.Scene.DEFAULT_CANVAS_ID;
                canvas = document.getElementById(canvasId);
                if (!canvas) {
                    throw SceneJS._errorModule.fatalError(new SceneJS.errors.CanvasNotFoundException
                            ("SceneJS.Scene config 'canvasId' does not match any elements in the page and no " +
                             "default canvas found with ID '" + SceneJS.Scene.DEFAULT_CANVAS_ID + "'"));
                }
            }
        }
        
        // If the canvas uses css styles to specify the sizes make sure the basic 
        // width and height attributes match or the WebGL context will use 300 x 150
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        
        var context;
        var contextNames = SceneJS.SUPPORTED_WEBGL_CONTEXT_NAMES;
        for (var i = 0; (!context) && i < contextNames.length; i++) {
            try {
                if (SceneJS._debugModule.getConfigs("webgl.logTrace") == true) {

                    context = canvas.getContext(contextNames[i]);
                    if (context) {
                        // context = WebGLDebugUtils.makeDebugContext(context);

                        context = WebGLDebugUtils.makeDebugContext(
                                context,
                                function(err, functionName, args) {
                                    SceneJS._loggingModule.error(
                                            "WebGL error calling " + functionName +
                                            " on WebGL canvas context - see console log for details");
                                });
                        context.setTracing(true);


                    }
                } else {
                    context = canvas.getContext(contextNames[i]);
                }
            } catch (e) {

            }
        }
        if (!context) {
            throw SceneJS._errorModule.fatalError(new SceneJS.errors.WebGLNotSupportedException
                    ('Canvas document element with ID \''
                            + canvasId
                            + '\' failed to provide a supported WebGL context'));
        }

        var zBufferDepth;
        zBufferDepth = context.getParameter(context.DEPTH_BITS);
        SceneJS._loggingModule.info("SceneJS.Scene using webgl context with Z-buffer depth of: " + zBufferDepth + " bits");

        context.clearColor(0.0, 0.0, 0.0, 1.0);
        context.clearDepth(1.0);
        context.enable(context.DEPTH_TEST);
        context.disable(context.CULL_FACE);
        context.depthRange(0, 1);
        context.disable(context.SCISSOR_TEST);
        return {
            canvas: canvas,
            context: context,
            canvasId : canvasId
        };
    }

    /** Registers a scene, finds it's canvas, and returns the ID under which the scene is registered
     * @private
     */
    this.createScene = function(scene, params) {
        if (!initialised) {
            SceneJS._loggingModule.info("SceneJS V" + SceneJS.VERSION + " initialised");
            SceneJS._eventModule.fireEvent(SceneJS._eventModule.INIT);
        }
        var canvas = findCanvas(params.canvasId); // canvasId can be null
        var loggingElement = findLoggingElement(params.loggingElementId); // loggingElementId can be null
        var sceneId = SceneJS._createKeyForMap(scenes, "s");
        scenes[sceneId] = {
            sceneId: sceneId,
            scene:scene,
            canvas: canvas,
            loggingElement: loggingElement
        };
        nScenes++;
        SceneJS._eventModule.fireEvent(SceneJS._eventModule.SCENE_CREATED, {sceneId : sceneId });
        SceneJS._loggingModule.info("Scene defined: " + sceneId);
        return sceneId;
    };

    /** Deregisters scene
     * @private
     */
    this.destroyScene = function(sceneId) {
        scenes[sceneId] = null;
        nScenes--;
        SceneJS._eventModule.fireEvent(SceneJS._eventModule.SCENE_DESTROYED, {sceneId : sceneId });
        if (activeSceneId == sceneId) {
            activeSceneId = null;
        }
        SceneJS._loggingModule.info("Scene destroyed: " + sceneId);
        if (nScenes == 0) {
            SceneJS._loggingModule.info("SceneJS reset");
            SceneJS._eventModule.fireEvent(SceneJS._eventModule.RESET);

        }
    };

    /** Specifies which registered scene is the currently active one
     * @private
     */
    this.activateScene = function(sceneId) {
        var scene = scenes[sceneId];
        if (!scene) {
            throw SceneJS._errorModule.fatalError("Scene not defined: '" + sceneId + "'");
        }
        activeSceneId = sceneId;
        SceneJS._eventModule.fireEvent(SceneJS._eventModule.LOGGING_ELEMENT_ACTIVATED, { loggingElement: scene.loggingElement });
        SceneJS._eventModule.fireEvent(SceneJS._eventModule.SCENE_RENDERING, { sceneId: sceneId, nodeId: sceneId, canvas : scene.canvas });
        SceneJS._eventModule.fireEvent(SceneJS._eventModule.CANVAS_ACTIVATED, scene.canvas);
    };

    /**
     * Fast redraw of scene that has been previously rendered
     *
     * @param sceneId
     */
    this.redrawScene = function(sceneId) {
        var scene = scenes[sceneId];
        if (!scene) {
            throw SceneJS._errorModule.fatalError("Scene not defined: '" + sceneId + "'");
        }
        SceneJS._eventModule.fireEvent(SceneJS._eventModule.CANVAS_ACTIVATED, scene.canvas);
        SceneJS._shaderModule.redraw();
        SceneJS._eventModule.fireEvent(SceneJS._eventModule.CANVAS_DEACTIVATED, scene.canvas);
    };

    /** Returns the canvas element the given scene is bound to
     * @private
     */
    this.getSceneCanvas = function(sceneId) {
        var scene = scenes[sceneId];
        if (!scene) {
            throw SceneJS._errorModule.fatalError("Scene not defined: '" + sceneId + "'");
        }
        return scene.canvas.canvas;
    };

    /** Returns the webgl context element the given scene is bound to
     * @private
     */
    this.getSceneContext = function(sceneId) {
        var scene = scenes[sceneId];
        if (!scene) {
            throw SceneJS._errorModule.fatalError("Scene not defined: '" + sceneId + "'");
        }
        return scene.canvas.context;
    };

    /** Returns all registered scenes
     * @private
     */
    this.getAllScenes = function() {
        var list = [];
        for (var id in scenes) {
            var scene = scenes[id];
            if (scene) {
                list.push(scene.scene);
            }
        }
        return list;
    };

    /** Finds a registered scene
     * @private
     */
    this.getScene = function(sceneId) {
        return scenes[sceneId].scene;
    };

    /** Deactivates the currently active scene and reaps destroyed and timed out processes
     * @private
     */
    this.deactivateScene = function() {
        if (!activeSceneId) {
            throw SceneJS._errorModule.fatalError("Internal error: no scene active");
        }
        var sceneId = activeSceneId;
        activeSceneId = null;
        var scene = scenes[sceneId];
        if (!scene) {
            throw SceneJS._errorModule.fatalError("Scene not defined: '" + sceneId + "'");
        }
        SceneJS._eventModule.fireEvent(SceneJS._eventModule.CANVAS_DEACTIVATED, scene.canvas);
        SceneJS._eventModule.fireEvent(SceneJS._eventModule.SCENE_RENDERED, {sceneId : sceneId });
    };
})();
