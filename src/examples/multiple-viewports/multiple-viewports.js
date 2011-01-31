/*
 Create four separate viewports into one scene of the venerable OpenGL teapot.

 Lindsay S. Kay,
 lindsay.kay@xeolabs.com

 To render the teapot, SceneJS will traverse the scene in depth-first order. Each node will set some
 WebGL state on visit, then un-set it again before exit. In this graph, the root
 scene node binds to a Canvas element, then the rest of the nodes specify various transforms, lights,
 material properties, all wrapping a teapot geometry node.

 This scene is interactive; to rotate the view, it takes two variables, "yaw" and "pitch", which are
 updated on rotate nodes from mouse input.

 */
SceneJS.createNode({

    type: "scene",

    /* ID that we'll access the scene by when we want to render it
     */
    id: "theScene",

    /* Bind scene to a WebGL canvas:
     */
    canvasId: "theCanvas",

    /* You can optionally write logging to a DIV - scene will log to the console as well.
     */
    loggingElementId: "theLoggingDiv",

    nodes: [
    
        {
            type: "library",

            nodes: [

                /* Camera describes the projection
                 */
                {
                    type: "camera",
                    id: "the-teapot",
                    
                    optics: {
                        type: "perspective",
                        fovy : 25.0,
                        aspect : 1.47,
                        near : 0.10,
                        far : 300.0
                    },

                    nodes: [


                        /* A lights node inserts  point lights into the world-space.
                         * You can have many of these, nested within modelling transforms
                         * if you want to move them around.
                         */
                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 1.0, g: 0.5, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                        },

                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.5, g: 1.0, b: 0.5 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: 0.0, y: 1.0, z: -1.0 }
                        },

                        {
                            type: "light",
                            mode:                   "dir",
                            color:                  { r: 0.2, g: 0.2, b: 1.0 },
                            diffuse:                true,
                            specular:               true,
                            dir:                    { x: -1.0, y: 0.0, z: -1.0 }
                        },

                        /* Next, modelling transforms to orient our teapot. See how these have IDs,
                         * so we can access them to set their angle attributes.
                         */
                        {
                            type: "rotate",
                            id: "pitch",
                            angle: 0.0,
                            x : 1.0,

                            nodes: [
                                {
                                    type: "rotate",
                                    id: "yaw",
                                    angle: 0.0,
                                    y : 1.0,

                                    nodes: [

                                        /* Specify the amounts of ambient, diffuse and specular
                                         * lights our teapot reflects
                                         */
                                        {
                                            type: "material",
                                            emit: 0,
                                            baseColor:      { r: 0.3, g: 0.3, b: 0.9 },
                                            specularColor:  { r: 0.9, g: 0.9, b: 0.9 },
                                            specular:       0.9,
                                            shine:          100.0,

                                            nodes: [

                                                {
                                                    type: "translate", // Example translation
                                                    x:0.0,
                                                    y:0.0,
                                                    z:0.0,

                                                    nodes : [
                                                        {
                                                            type: "scale",  // Example scaling
                                                            x:1.0,
                                                            y:1.0,
                                                            z:1.0,

                                                            nodes: [
                                                                {
                                                                    type : "teapot"
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        
        /*==================================================================================
         * Our first renderer node, with default values defined for all properties.
         * ================================================================================*/

        {
            type: "renderer",
        
            /*----------------------------------------
             Miscelleneous settings
             -----------------------------------------*/

            /* Specifies which buffers are cleared for each frame
             */
            clear: {
                depth : true,
                color : true,
                stencil: false
            },

            /* Specify clear values for the colour buffers
             */
            clearColor: {
                r: 0,
                g : 0,
                b : 0
            },

            /* First viewport  is the upper-left quadrant
             */
            viewport: {
                x : 0,
                y : 350,
                width: 515,
                height: 350
            },

            /* Set the width of rasterised lines
             */
            lineWidth: 1,


            /*----------------------------------------
             Blending
             -----------------------------------------*/

            /* Enable or disable blending
             */
            enableBlend: false,

            /* Set the blend color
             */
            blendColor: {
                r: 0.0,
                g: 0.0,
                b: 0.0,
                a: 1.0
            },

            /* Specify the equation used for both the RGB blend equation and the Alpha blend equation.
             * Accepted values are: func_add, func_subtract, func_reverse_subtract
             */
            blendEquation: "funcAdd",

            /* Set the RGB and alpha blend equations separately
             */
            blendEquationSeperate: {
                rgb: "funcAdd",
                alpha: "funcAdd"
            },

            /* Specify pixel arithmetic. Accepted values for sfactor and dfactor are:
             * zero, one, src_color, src_alpha, constant_color, one_minus_src_alpha,
             * one_minus_src_color, one_minus_constant_color, one_minus_constant_alpha,
             * dts_color, dst_alpha, one_minus_dst_alpha, one_minus_dst_color
             */
            blendFunc: {
                sfactor: "one",
                dfactor: 'one'
            },

            /* Set the RGB and alpha blend functions separately
             */
            blendFuncSeperate: {
                srcRGB: "one",
                dstRGB: "one",
                srcAlpha: "one",
                dstAlpha: "one"
            },


            /*----------------------------------------
             Depth buffer
             -----------------------------------------*/

            /* Enable/disable depth testing
             */
            enableDepthTest:true,

            /* Specify the value used for depth buffer comparisons. Accepted values are: never, less, equal,
             * lequal, greater, notequal, gequal, always
             */
            depthFunc: "lequal",

            /* Enable/disable writing into the depth buffer
             */
            depthMask: true,

            /* Specify mapping of depth values from normalised device coordinates to window coordinates
             */
            depthRange: {
                zNear: 0,
                zFar: 1
            },

            /* Specify the clear value for the depth buffer
             */
            clearDepth: 1.0,
        
            nodes: [
                
                /* Viewing transform specifies eye position, looking
                 * at the origin by default
                 */
                {
                    type: "lookAt",
                    id: "firstLookAt",
                    eye : { x: 0.0, y: 10.0, z: -15 },
                    look : { y:1.0 },
                    up : { y: 1.0 },

                    nodes: [ 
                
                        { 
                            type: "instance", 
                            target: "the-teapot"
                        } 
                    ]
                }
            ]
        },
        
        /*==================================================================================
         * Our second renderer node, with default values defined for all properties.
         * ================================================================================*/

        {
            type: "renderer",
        
            /*----------------------------------------
             Miscelleneous settings
             -----------------------------------------*/

            /* Specifies which buffers are cleared for each frame
             */
            clear: {
                depth : true,
                color : true,
                stencil: false
            },

            /* Specify clear values for the colour buffers
             */
            clearColor: {
                r: 0,
                g : 0,
                b : 0
            },

            /* Second viewport  is the upper-right quadrant
             */
            viewport: {
                x : 515,
                y : 350,
                width: 515,
                height: 350
            },

            /* Set the width of rasterised lines
             */
            lineWidth: 1,


            /*----------------------------------------
             Blending
             -----------------------------------------*/

            /* Enable or disable blending
             */
            enableBlend: false,

            /* Set the blend color
             */
            blendColor: {
                r: 0.0,
                g: 0.0,
                b: 0.0,
                a: 1.0
            },

            /* Specify the equation used for both the RGB blend equation and the Alpha blend equation.
             * Accepted values are: func_add, func_subtract, func_reverse_subtract
             */
            blendEquation: "funcAdd",

            /* Set the RGB and alpha blend equations separately
             */
            blendEquationSeperate: {
                rgb: "funcAdd",
                alpha: "funcAdd"
            },

            /* Specify pixel arithmetic. Accepted values for sfactor and dfactor are:
             * zero, one, src_color, src_alpha, constant_color, one_minus_src_alpha,
             * one_minus_src_color, one_minus_constant_color, one_minus_constant_alpha,
             * dts_color, dst_alpha, one_minus_dst_alpha, one_minus_dst_color
             */
            blendFunc: {
                sfactor: "one",
                dfactor: 'one'
            },

            /* Set the RGB and alpha blend functions separately
             */
            blendFuncSeperate: {
                srcRGB: "one",
                dstRGB: "one",
                srcAlpha: "one",
                dstAlpha: "one"
            },


            /*----------------------------------------
             Depth buffer
             -----------------------------------------*/

            /* Enable/disable depth testing
             */
            enableDepthTest:true,

            /* Specify the value used for depth buffer comparisons. Accepted values are: never, less, equal,
             * lequal, greater, notequal, gequal, always
             */
            depthFunc: "lequal",

            /* Enable/disable writing into the depth buffer
             */
            depthMask: true,

            /* Specify mapping of depth values from normalised device coordinates to window coordinates
             */
            depthRange: {
                zNear: 0,
                zFar: 1
            },

            /* Specify the clear value for the depth buffer
             */
            clearDepth: 1.0,
        
            nodes: [

                
                /* Viewing transform specifies eye position, looking
                 * at the origin by default
                 */
                {
                    type: "lookAt",
                    id: "secondLookAt",
                    eye : { x: -15.0, y: 10.0, z: 0 },
                    look : { y:1.0 },
                    up : { y: 1.0 },

                    nodes: [ 
                
                        { 
                            type: "instance", 
                            target: "the-teapot"
                        } 
                    ]
                }
            ]
        }
    ]
});


/*----------------------------------------------------------------------
 * Scene rendering loop and mouse handler stuff follows
 *---------------------------------------------------------------------*/
var yaw = 0;
var pitch = 0;
var lastX;
var lastY;
var dragging = false;

SceneJS.withNode("theScene").render();

var canvas = document.getElementById("theCanvas");

function mouseDown(event) {
    lastX = event.clientX;
    lastY = event.clientY;
    dragging = true;
}

function mouseUp() {
    dragging = false;
}

/* On a mouse drag, we'll re-render the scene, passing in
 * incremented angles in each time.
 */
function mouseMove(event) {
    if (dragging) {
        yaw += (event.clientX - lastX) * 0.5;
        pitch += (event.clientY - lastY) * -0.5;

        SceneJS.withNode("yaw").set("angle", yaw);
        SceneJS.withNode("pitch").set("angle", pitch);

        SceneJS.withNode("theScene").render();

        lastX = event.clientX;
        lastY = event.clientY;
    }
}

canvas.addEventListener('mousedown', mouseDown, true);
canvas.addEventListener('mousemove', mouseMove, true);
canvas.addEventListener('mouseup', mouseUp, true);



