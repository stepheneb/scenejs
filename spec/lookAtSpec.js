describe("lookAt", function() {

    it("should be defined", function() {
        expect(SceneJS.withNode("the-lookat")).toBeDefined();
    });

    it("should have an eye", function() {
        var lookAt = SceneJS.withNode("the-lookat");
        var eye = lookAt.get("eye");
        expect(eye).toEqual({ x: 0, y: 0, z: -5});
    });

    it("should be looking at { x :  0, y: 0, z: 0 }", function() {
        var lookAt = SceneJS.withNode("the-lookat");
        var look = lookAt.get("look");
        expect(look).toEqual({ x :  0, y: 0, z: 0 });
    });

    it("should look right after rotating -15", function() {
        SceneJS.Message.sendMessage({
            command: "lookAt.rotate",
            target: "the-lookat",
            angle: -15,
            ignoreY: true
        });
        var lookAt = SceneJS.withNode("the-lookat");
        var look = lookAt.get("look");
        expect(look).toEqualLook({ x : -1.294, y : 0, z : -0.170 });
    });

    it("should look back at the origin after rotating -15 and then 15", function() {
        SceneJS.Message.sendMessage({
            command: "lookAt.rotate",
            target: "the-lookat",
            angle: -15,
            ignoreY: true
        });
        SceneJS.Message.sendMessage({
            command: "lookAt.rotate",
            target: "the-lookat",
            angle: 15,
            ignoreY: true
        });
        var lookAt = SceneJS.withNode("the-lookat");
        var look = lookAt.get("look");
        expect(look).toEqualLook({ x :  0, y: 0, z: 0 });
    });

    beforeEach(function() {
        SceneJS.createNode({
            type: "scene",
            id: "the-scene",
            canvasId: "theCanvas",
            loggingElementId: "theLoggingDiv",

            nodes: [
                {
                    type: "lookAt",
                    id: "the-lookat",
                    eye : { x: 0, y: 0, z: -5 },
                    look : { x :  0, y: 0, z: 0 },
                    up : { y: 1.0 },

                    nodes: [
                        {
                            type: "camera",
                            optics: {
                                type: "perspective",
                                fovy : 45.0,
                                aspect : 1.47,
                                near : 0.10,
                                far : 7000.0
                            },

                            nodes: [
                                {
                                    type: "light",
                                    mode:                   "dir",
                                    color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 1.0, y: 1.0, z: -1.0 }
                                },
                                {
                                    type: "light",
                                    mode:                   "dir",
                                    color:                  { r: 0.8, g: 0.8, b: 0.8 },
                                    diffuse:                true,
                                    specular:               true,
                                    dir:                    { x: 2.0, y: 1.0, z: 0.0 }
                                },

                                {
                                    type: "translate",
                                    x: 0,
                                    y: 0,
                                    z: 0,

                                    nodes: [
                                        {
                                            type: "scale",
                                            x: 1,
                                            y: 1,
                                            z: 1,

                                            nodes: [
                                                {
                                                    type: "rotate",
                                                    id: 'spin',
                                                    angle: 0,
                                                    y: 1.0,

                                                    nodes: [ 
                                                        {
                                                            type: "sphere" 
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
        });

        var canvas = document.getElementById("theCanvas");
        
        SceneJS.withNode("the-scene").render();
        
    });

    afterEach(function() {
        SceneJS.withNode("the-scene").render();
    });

});