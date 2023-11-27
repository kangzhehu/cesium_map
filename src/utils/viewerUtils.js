import * as Cesium from "cesium/Cesium";
import Store from "../store";
/*********************全局静态变量************************/
export const staticParams = {
  viewer: undefined,
  weatherInstance: {
    //天气实例
    rain: undefined, //雨
    snow: undefined, //雪
    fog: undefined, //云雾
    night: undefined, //黑夜
    clouds: undefined,
  },
  customShader:undefined,
  activeShapePoints: [],
  entityPlane: undefined,
  floatingPoint: undefined,
  building: undefined, //建筑
  model0: undefined, //建筑模型
  model1: undefined,
  model2: undefined,
};

/**
 * 初始化视图
 * @param {Viewer} _viewerId
 */
export function initViewer(_viewerId) {
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMzU2ZTQyYy1iOTU5LTQ5MDQtOGNkNC0yYzcxMTI1ZDJiZGQiLCJpZCI6NzY1OTcsImlhdCI6MTYzOTU2MDcwOH0.kbWigipGD6l2OPBGpnkkN6dzp8NuNjoHNNM1NF4gaIo";
  staticParams.viewer = new Cesium.Viewer(_viewerId, {
    animation: false, //是否创建动画小器件，左下角仪表
    baseLayerPicker: false, //是否显示图层选择器
    fullscreenButton: false, //是否显示全屏按钮
    geocoder: true, //是否显示geocoder小器件，右上角查询按钮
    homeButton: false, //是否显示Home按钮
    infoBox: false, //是否显示信息框
    sceneModePicker: false, //是否显示3D/2D选择器
    selectionIndicator: false, //是否显示选取指示器组件
    timeline: false, //是否显示时间轴
    navigationHelpButton: false, //是否显示右上角的帮助按钮
    scene3DOnly: true, //*如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
    //! 加载天地图(没用)
    imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
      url: "http://t0.tianditu.gov.cn/img_w/wmts?tk=48bb1dd3563a5bc657b0c78d2bd37bc3",
      // url:"http://t{s}.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=48bb1dd3563a5bc657b0c78d2bd37bc3",
      layer: "img",
      style: "default",
      tileMatrixSetID: "w",
      format: "tiles",
      maximumLevel: 18,
    }),

    // 创建三维地形
    terrainProvider: Cesium.createWorldTerrain(),
    //基于太阳位置开启地形照明
    requestVertexNormals: true,
    //启用水体效果
    requestWaterMask: true,
    contextOptions: {
      requestWebgl1: false,
      allowTextureFilterAnisotropic: true,
      webgl: {
        alpha: false,
        depth: true,
        stencil: false,
        antialias: true,
        powerPreference: "high-performance",
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
      },
    },
   
  });

  staticParams.viewer.scene.debugShowFramesPerSecond = true;
  //去除底部的商标（版权）信息
  staticParams.viewer.cesiumWidget.creditContainer.style.display = "none";
  staticParams.viewer.scene.globe.enableLighting = true;
  //不显示主页按钮
  //飞到目标区域
  staticParams.viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(121.502241, 31.249633, 3000.0),
    //设置相机朝向：俯仰角、倾角
    orientation: {
      heading: Cesium.Math.toRadians(350),
      pitch: Cesium.Math.toRadians(-50),
      roll: 0.0,
    },
  });
  Cesium.ExperimentalFeatures.enableModelExperimental = true
  createBuilds(staticParams.viewer);
  mouseHovershowInfo(staticParams.viewer);
  initWeatherEffect(staticParams.viewer);
  createRemoveClouds(staticParams.viewer);
  initScene(staticParams.viewer);
  createRoad("./road.json");
  createRoad("./road2.json");
  
}

/**
 * 加载三D建筑模型
 * @param {*} _viewer
 */
export function createBuilds(_viewer) {
  let osmBuildings = Cesium.createOsmBuildings(
);

  staticParams.building = _viewer.scene.primitives.add(osmBuildings);
  // console.log(osmBuildings);
  // console.log(staticParams.building);
}

export function initScene(viewer) {
  viewer._cesiumWidget._creditContainer.style.display = "none";
  viewer.resolutionScale = 1.2;
  viewer.scene.msaaSamples = 4;
  viewer.postProcessStages.fxaa.enabled = true;
  viewer.scene.globe.depthTestAgainstTerrain = true;
  viewer.scene.debugShowFramesPerSecond = true;
  // viewer.scene.globe.shadows = Cesium.ShadowMode.ENABLED;

  viewer.shadows = true; //设置日照阴影
  viewer.shadowMap.size = 2048;
  viewer.shadowMap.softShadows = false;
  viewer.shadowMap.maximumDistance = 4000;
  viewer.scene.globe.enableLighting = true; //开启日照
  viewer.scene.globe.atmosphereLightIntensity = 20;
  viewer.scene.globe.atmosphereBrightnessShift = -0.01;

  //泛光效果设置
  viewer.scene.postProcessStages.bloom.enabled = false;
  viewer.scene.postProcessStages.bloom.uniforms.contrast = 119;
  viewer.scene.postProcessStages.bloom.uniforms.brightness = -0.4;
  viewer.scene.postProcessStages.bloom.uniforms.glowOnly = false;
  viewer.scene.postProcessStages.bloom.uniforms.delta = 0.9;
  viewer.scene.postProcessStages.bloom.uniforms.sigma = 3.78;
  viewer.scene.postProcessStages.bloom.uniforms.stepSize = 5;
  viewer.scene.postProcessStages.bloom.uniforms.isSelected = false;

  //环境光遮蔽效果设置
  viewer.scene.postProcessStages.ambientOcclusion.enabled = false;
  viewer.scene.postProcessStages.ambientOcclusion.uniforms.intensity = 1.5;
  viewer.scene.postProcessStages.ambientOcclusion.uniforms.bias = 0.4;
  viewer.scene.postProcessStages.ambientOcclusion.uniforms.lengthCap = 0.45;
  viewer.scene.postProcessStages.ambientOcclusion.uniforms.stepSize = 1.8;
  viewer.scene.postProcessStages.ambientOcclusion.uniforms.blurStepSize = 1.0;
}

/**
 * 显示底部信息
 * @param {三维视图实例} _viewer
 * @param {鼠标位置} _position
 */
export function ShowFooterInfo(_viewer, _position) {
  //! 根据鼠标悬停的位置，在二维世界坐标系中创建 相机视线
  var windowPosition = _viewer.camera.getPickRay(_position);

  var cartesianCoordinates = _viewer.scene.globe.pick(
    windowPosition,
    _viewer.scene
  );
  var cartographic =
    _viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesianCoordinates);
  let itemProperty = {
    lng: Cesium.Math.toDegrees(cartographic.longitude).toFixed(6), //经度值
    lat: Cesium.Math.toDegrees(cartographic.latitude).toFixed(6), //纬度值
    // alt: Cesium.Math.toDegrees(cartographic.height).toFixed(6), //高程值(本身为m，无需转换)
    alt: cartographic.height.toFixed(6), //高程值
    dir: Math.floor((_viewer.camera.heading * 180) / Math.PI), //相机方向-弧度转角度
    angle: Math.floor((_viewer.camera.pitch * 180) / Math.PI), //相机俯仰角-弧度转角度
    sceneAlt: _viewer.camera.positionCartographic.height.toFixed(2), //视高-相机高度
  };
  Store.dispatch("setFooterPropertiesAsync", itemProperty);
}

/**
 * 信息点鼠标悬浮展示信息
 * @param {三维视图实例} _viewer
 */
export function mouseHovershowInfo(_viewer) {
  let canvas = _viewer.scene.canvas;
  let infoHandler = new Cesium.ScreenSpaceEventHandler(canvas);

  infoHandler.setInputAction(function (click) {
    try {
      ShowFooterInfo(_viewer, click.endPosition);
    } catch (error) {
      console.log(error);
    }
    let pickedFeature = _viewer.scene.pick(click.endPosition);
    // console.log('=====',pickedFeature);
    if (!Cesium.defined(pickedFeature)) {
      return false;
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}
/**************日照*****************/
export function SunlightAna(_viewer) {
  if (_viewer.clock.shouldAnimate == false) {
    _viewer.clock.shouldAnimate = true;
    _viewer.scene.globe.enableLighting = true;
    _viewer.shadows = true;
    _viewer.clock.startTime = Cesium.JulianDate.fromDate(
      new Date(new Date().setHours(10))
    );
    _viewer.clock.stopTime = Cesium.JulianDate.fromDate(
      new Date(new Date().setHours(18))
    );
    _viewer.clock.clockRANGE = Cesium.ClockRange.LOOP_STOP; // 停止行为
    // _viewer.clock.clockStep = Cesium.clockStep.SYSTEM_CLOCK_MULTIPLIER
    _viewer.clock.multiplier = 1600;
    console.log(_viewer.clock.startTime);
    console.log(_viewer.clock);
  }
}
/************绘制路线*********************** */
function createPoint(_viewer, worldPosition) {
  const point = _viewer.entities.add({
    position: worldPosition,
    point: {
      color: Cesium.Color.YELLOW,
      pixelSize: 8,
      outlineColor: Cesium.Color.YELLOW,
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    },
  });
  return point;
}

function drawPolyline(_viewer, positions) {
  if (positions.length < 1) return;
  // let startP = positions[0];
  // let endP = positions[positions.length - 1];
  // if (startP.x != endP.x && startP.y != endP.y && startP.z != endP.z)
  //   positions.push(positions[0]);

  return _viewer.entities.add({
    name: "polyline",
    polyline: {
      positions: positions,
      width: 4.0,
      material: Cesium.Color.SKYBLUE,
      clampToGround: true,
    },
  });
}
let tempEntities = [];
export function drawShapeRange(_viewer) {
  _viewer.scene.globe.depthTestAgainstTerrain = true;
  let canvas = _viewer.scene.canvas;
  let handler = new Cesium.ScreenSpaceEventHandler(canvas);
  handler.setInputAction((event) => {
    const earthPosition = _viewer.scene.pickPosition(event.position);
    if (Cesium.defined(earthPosition)) {
      if (staticParams.activeShapePoints.length === 0) {
        staticParams.floatingPoint = createPoint(_viewer, earthPosition);
        staticParams.activeShapePoints.push(earthPosition);
        const dynamicPositions = new Cesium.CallbackProperty(() => {
          return new Cesium.PolygonHierarchy(staticParams.activeShapePoints);
        }, false);
        console.log(dynamicPositions);
        console.log(staticParams.activeShapePoints);
      }
      staticParams.activeShapePoints.push(earthPosition);
      tempEntities.push(createPoint(_viewer, earthPosition));
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  handler.setInputAction((event) => {
    if (Cesium.defined(staticParams.floatingPoint)) {
      const newPosition = _viewer.scene.pickPosition(event.endPosition);
      if (Cesium.defined(newPosition)) {
        staticParams.floatingPoint.position.setValue(newPosition);
        staticParams.activeShapePoints.pop();
        staticParams.activeShapePoints.push(newPosition);
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

  // eslint-disable-next-line no-unused-vars
  handler.setInputAction((event) => {
    staticParams.activeShapePoints.pop();
    // if (staticParams.activeShapePoints.length < 3) return;

    tempEntities.push(drawPolyline(_viewer, staticParams.activeShapePoints));
    _viewer.entities.remove(staticParams.floatingPoint);
    console.log(staticParams.activeShapePoints);
    console.log(staticParams.floatingPoint);
    staticParams.floatingPoint = undefined;
    staticParams.activeShape = undefined;
    handler.destroy(); //关闭事件句柄
    handler = null;
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}

/**************漫游*****************/
//开始漫游
export function flyTo(viewer) {
  //播放
  viewer.clock.shouldAnimate = true;
  var startFly = Cesium.JulianDate.fromDate(new Date(2015, 2, 25, 16));
  var stopFly = Cesium.JulianDate.addSeconds(
    startFly,
    360,
    new Cesium.JulianDate()
  );
  viewer.clock.startTime = startFly.clone();
  viewer.clock.stopTime = stopFly.clone();
  viewer.clock.currentTime = startFly.clone();
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
  viewer.clock.multiplier = 10;
  // console.log(viewer);
  // viewer.timeline.zoomTo(startFly, stopFly);
  var position = staticParams.activeShapePoints;
  var property = new Cesium.SampledPositionProperty();
  var timeI = parseInt(360 / position.length);
  for (let i = 0; i < position.length; i++) {
    const time = Cesium.JulianDate.addSeconds(
      startFly,
      i * timeI,
      new Cesium.JulianDate()
    );

    property.addSample(time, position[i]);
  }
  //飞机模型
  staticParams.entityPlane = staticParams.viewer.entities.add({
    //设置时间
    availability: new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: startFly,
        stop: stopFly,
      }),
    ]),
    //Use our computed positions
    position: property,
    //基于位置运动的自动定位
    orientation: new Cesium.VelocityOrientationProperty(property),
    model: {
      uri: "./feiji.glb",
      minimumPixelSize: 64,
    },
    //Show the path as a pink line sampled in 1 second increments.
    path: {
      resolution: 1,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.1,
        color: Cesium.Color.GREEN,
      }),
      width: 16,
    },
  });
  //追踪物体
  viewer.trackedEntity = staticParams.entityPlane;
  // console.log(viewer);
}

//停止漫游
export function stopFly(viewer) {
  //停止播放
  viewer.clock.shouldAnimate = false;
  viewer.trackedEntity = undefined;
  //清除模型
  console.log(viewer);
  viewer.entities.remove(staticParams.entityPlane);
  //清除线
  var length = tempEntities.length;
  for (let f = 0; f < length; f++) {
    viewer.entities.remove(tempEntities[f]);
  }
  staticParams.floatingPoint = undefined;
  staticParams.activeShape = undefined;
}

/**************道路*****************/

/**
 * 自定义材质线 github:cesium-materialLine
 * @param {*} options
 * @returns
 */
function CustomMaterialLine(options) {
  let Color = Cesium.Color,
    defaultValue = Cesium.defaultValue,
    defined = Cesium.defined,
    defineProperties = Object.defineProperties,
    Event = Cesium.Event,
    createPropertyDescriptor = Cesium.createPropertyDescriptor,
    Property = Cesium.Property,
    Material = Cesium.Material,
    defaultColor = Color.WHITE,
    currentTime = window.performance.now(),
    MaterialType =
      options.MaterialType || "wallType" + parseInt(Math.random() * 1000);
  function PolylineCustomMaterialProperty(options) {
    options = defaultValue(options, defaultValue.EMPTY_OBJECT);
    this._definitionChanged = new Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this.color = options.color || Cesium.Color.BLUE;
    this.duration = options.duration || 1000;
    this._time = currentTime;
  }
  defineProperties(PolylineCustomMaterialProperty.prototype, {
    isvarant: {
      get: function () {
        return false;
      },
    },
    definitionChanged: {
      get: function () {
        return this._definitionChanged;
      },
    },
    color: createPropertyDescriptor("color"),
  });
  // eslint-disable-next-line no-unused-vars
  PolylineCustomMaterialProperty.prototype.getType = function (time) {
    return MaterialType;
  };
  PolylineCustomMaterialProperty.prototype.getValue = function (time, result) {
    if (!defined(result)) {
      result = {};
    }
    window.m3d = true;
    result.color = Property.getValueOrClonedDefault(
      this._color,
      time,
      defaultColor,
      result.color
    );
    result.image = options.image;
    result.time =
      ((window.performance.now() - this._time) % this.duration) / this.duration;
    return result;
  };
  PolylineCustomMaterialProperty.prototype.equals = function (other) {
    return (
      this === other ||
      (other instanceof PolylineCustomMaterialProperty &&
        Property.equals(this._color, other._color))
    );
  };
  Material._materialCache.addMaterial(MaterialType, {
    fabric: {
      type: MaterialType,
      uniforms: {
        color: options.color || new Cesium.Color(1.0, 0.0, 0.0, 0.5),
        image: options.image,
        time: 0,
      },
      source: `czm_material czm_getMaterial(czm_materialInput materialInput)
              {
                  czm_material material = czm_getDefaultMaterial(materialInput);
                  vec2 st = materialInput.st;
                  if(texture2D(image, vec2(0.0, 0.0)).a == 1.0){
                      discard;
                  }else{
                      material.alpha = texture2D(image, vec2(1.0 - fract(time - st.s), st.t)).a * color.a;
                  }
                  material.diffuse = max(color.rgb * material.alpha * 3.0, color.rgb);
                  return material;
              }
              `,
    },
    // eslint-disable-next-line no-unused-vars
    translucent: function (material) {
      return true;
    },
  });
  return new PolylineCustomMaterialProperty(options);
}

// 创建材质线
let getCustomMaterialLine = (image, color) => {
  return new CustomMaterialLine({
    image: image,
    color: color,
    duration: 1000,
  });
};
let createRoad = (url) => {
  let promise = Cesium.GeoJsonDataSource.load(url);
  promise.then((dataSource) => {
    staticParams.viewer.dataSources.add(dataSource);
    let entities = dataSource.entities.values;
    for (let o = 0; o < entities.length; o++) {
      entities[o].polyline.width = 1.5;
      entities[o].polyline.clampToGround = true;
      entities[o].polyline.material = getCustomMaterialLine(
        "./line.png",
        Cesium.Color.fromRandom()
      );
      // entities[o].polyline.material = new Cesium.Spriteline1MaterialProperty(1000, './spriteline3.png');
      // getCustomMaterialLine("../assets/images/line.png", Cesium.Color.fromRandom())
    }
  });
};

/************建筑自定义*************/
staticParams.customShader =  new Cesium.CustomShader({
    uniforms: {
      u_envTexture: {
        value: new Cesium.TextureUniform({
          url: "./sky.jpg",
        }),
        type: Cesium.UniformType.SAMPLER_2D,
      },
      u_envTexture2: {
        value: new Cesium.TextureUniform({
          url: "./pic.jpg",
        }),
        type: Cesium.UniformType.SAMPLER_2D,
      },
      
    },

    mode: Cesium.CustomShaderMode.REPLACE_MATERIAL,
    lightingModel: Cesium.LightingModel.UNLIT,
    fragmentShaderText: `
    void fragmentMain(FragmentInput fsInput,inout czm_modelMaterial material) {
      vec3 positionMC = fsInput.attributes.positionMC;
      vec3 positionEC = fsInput.attributes.positionEC;
      vec3 normalEC = fsInput.attributes.normalEC;
      vec3 posToCamera = normalize(-positionEC); 
      vec3 coord = normalize(vec3(czm_inverseViewRotation * reflect(posToCamera, normalEC)));
      float ambientCoefficient = 0.3;
      float diffuseCoefficient = max(0.0, dot(normalEC, czm_sunDirectionEC) * 1.0);

          // dark
          vec4 darkRefColor = texture2D(u_envTexture2, vec2(coord.x, (coord.z - coord.y) / 2.0));
          material.diffuse = mix(mix(vec3(0.3), vec3(0.1,0.2,0.4),clamp(positionMC.z / 200., 0.0, 1.0)) , darkRefColor.rgb ,0.3);
          material.diffuse *= 0.1;
          // 注意shader中写浮点数是 一定要带小数点 否则会报错 比如0需要写成0.0 1要写成1.0
          float _baseHeight = 0.0; // 物体的基础高度，需要修改成一个合适的建筑基础高度
          float _heightRange = 20.0; // 高亮的范围(_baseHeight ~ _baseHeight + _heightRange)
          float _glowRange = 300.0; // 光环的移动范围(高度)
          // 建筑基础色
          float czm_height = positionMC.z - _baseHeight;
          float czm_a11 = fract(czm_frameNumber / 120.0) * 3.14159265 * 2.0;
          float czm_a12 = czm_height / _heightRange + sin(czm_a11) * 0.1;

          float times = czm_frameNumber / 60.0;
          material.diffuse *= vec3(czm_a12);// 渐变
          // 动态光环
          float time = fract(czm_frameNumber / 360.0);
          time = abs(time - 0.5) * 1.0;
          float czm_h = clamp(czm_height / _glowRange, 0.0, 1.0);
          float czm_diff = step(0.005, abs(czm_h - time));
          material.diffuse += material.diffuse * (1.0 - czm_diff);
      material.alpha = 1.0;
  }
    `
  })
/**************天气*****************/

//创建云
Cesium.Math.setRandomNumberSeed(2.5);
function getRandomNumberInRange(minValue, maxValue) {
  return minValue + Cesium.Math.nextRandomNumber() * (maxValue - minValue);
}
let clouds = new Cesium.CloudCollection();
//创建云层
function createBackLayerClouds() {
  clouds.add({
    position: Cesium.Cartesian3.fromDegrees(121.502241, 31.279633, 300),
    scale: new Cesium.Cartesian2(1500, 250),
    maximumSize: new Cesium.Cartesian3(50, 15, 13),
    slice: 0.3,
  });

  clouds.add({
    position: Cesium.Cartesian3.fromDegrees(121.52, 31.24, 335),
    scale: new Cesium.Cartesian2(1500, 300),
    maximumSize: new Cesium.Cartesian3(50, 12, 15),
    slice: 0.36,
  });

  clouds.add({
    position: Cesium.Cartesian3.fromDegrees(121.51, 31.31, 260),
    scale: new Cesium.Cartesian2(2000, 300),
    maximumSize: new Cesium.Cartesian3(50, 12, 15),
    slice: 0.49,
  });

  clouds.add({
    position: Cesium.Cartesian3.fromDegrees(121.495, 31.2752, 250),
    scale: new Cesium.Cartesian2(230, 110),
    maximumSize: new Cesium.Cartesian3(13, 13, 13),
    slice: 0.2,
  });

  clouds.add({
    position: Cesium.Cartesian3.fromDegrees(121.71, 31.522, 270),
    scale: new Cesium.Cartesian2(1700, 300),
    maximumSize: new Cesium.Cartesian3(50, 12, 15),
    slice: 0.6,
  });

  clouds.add({
    position: Cesium.Cartesian3.fromDegrees(121.495, 31.275, 250),
    scale: new Cesium.Cartesian2(230, 110),
    maximumSize: new Cesium.Cartesian3(15, 13, 15),
    slice: 0.35,
  });

  clouds.add({
    position: Cesium.Cartesian3.fromDegrees(121.496, 31.2726, 220),
    scale: new Cesium.Cartesian2(1500, 500),
    maximumSize: new Cesium.Cartesian3(30, 20, 17),
    slice: 0.45,
  });
}
// 随机云层位置
let long, lat, height, scaleX, scaleY, aspectRatio, cloudHeight, depth, slice;
function createRandomClouds(
  numClouds,
  startLong,
  stopLong,
  startLat,
  stopLat,
  minHeight,
  maxHeight
) {
  const rangeLong = stopLong - startLong;
  const rangeLat = stopLat - startLat;
  for (let i = 0; i < numClouds; i++) {
    long = startLong + getRandomNumberInRange(0, rangeLong);
    lat = startLat + getRandomNumberInRange(0, rangeLat);
    height = getRandomNumberInRange(minHeight, maxHeight);
    scaleX = getRandomNumberInRange(150, 350);
    scaleY = scaleX / 2.0 - getRandomNumberInRange(0, scaleX / 4.0);
    slice = getRandomNumberInRange(0.3, 0.7);
    depth = getRandomNumberInRange(5, 20);
    aspectRatio = getRandomNumberInRange(1.5, 2.1);
    cloudHeight = getRandomNumberInRange(5, 20);
    clouds.add({
      position: Cesium.Cartesian3.fromDegrees(long, lat, height),
      scale: new Cesium.Cartesian2(scaleX, scaleY),
      maximumSize: new Cesium.Cartesian3(
        aspectRatio * cloudHeight,
        cloudHeight,
        depth
      ),
      slice: slice,
    });
  }
}

// manually position clouds in front
// const scratch = new Cesium.Cartesian3();
function createFrontLayerClouds() {
  clouds.add({
    position: Cesium.Cartesian3.fromDegrees(121.496, 31.2726, 97),
    scale: new Cesium.Cartesian2(400, 150),
    maximumSize: new Cesium.Cartesian3(25, 12, 15),
    slice: 0.36,
  });

  clouds.add({
    position: Cesium.Cartesian3.fromDegrees(121.49565, 31.2762, 76),
    scale: new Cesium.Cartesian2(450, 200),
    maximumSize: new Cesium.Cartesian3(25, 14, 12),
    slice: 0.3,
  });
}

createBackLayerClouds();
createRandomClouds(10, 121.491, 121.58, 31.24, 31.435, 50, 250);
createFrontLayerClouds();
staticParams.weatherInstance.clouds = clouds;
export function createRemoveClouds(_viewer) {
  staticParams.weatherInstance.clouds.show = false;
  _viewer.scene.primitives.add(staticParams.weatherInstance.clouds);
}

/**
 *
 * @param {*} _viewer
 */
export function initWeatherEffect(_viewer) {
  //初始雪花特效
  if (staticParams.weatherInstance.snow)
    _viewer.scene.postProcessStages.remove(staticParams.weatherInstance.snow);
  staticParams.weatherInstance.snow = new Cesium.PostProcessStage({
    name: "czm_snow",
    fragmentShader:
      "\n\
          uniform sampler2D colorTexture;\n\
          varying vec2 v_textureCoordinates;\n\
          float snow(vec2 uv,float scale)\n\
          {\n\
          float time = czm_frameNumber / 60.0;\n\
           float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;\n\
           uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;\n\
            uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;\n\
            p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);\n\
           k=smoothstep(0.,k,sin(f.x+f.y)*0.01);\n\
          return k*w;\n\
          }\n\
          void main(void){\n\
           vec2 resolution = czm_viewport.zw;\n\
           vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
           vec3 finalColor=vec3(0);\n\
             float c = 0.0;\n\
            c+=snow(uv,30.)*.0;\n\
            c+=snow(uv,20.)*.0;\n\
           c+=snow(uv,15.)*.0;\n\
           c+=snow(uv,10.);\n\
           c+=snow(uv,8.);\n\
            c+=snow(uv,6.);\n\
           c+=snow(uv,5.);\n\
            finalColor=(vec3(c)); \n\
          gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.5); \n\
          }",
  });
  //2-初始化下雨特效
  if (staticParams.weatherInstance.rain)
    _viewer.scene.postProcessStages.remove(staticParams.weatherInstance.rain);
  //创建新的实例
  staticParams.weatherInstance.rain = new Cesium.PostProcessStage({
    name: "czm_rain",
    fragmentShader:
      "\n\
      uniform sampler2D colorTexture;\n\
        varying vec2 v_textureCoordinates;\n\
        float hash(float x)\n\
        {\n\
         return fract(sin(x*133.3)*13.13);\n\
        }\n\
        void main(void){\n\
          float time = czm_frameNumber / 60.0;\n\
         vec2 resolution = czm_viewport.zw;\n\
          vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
          vec3 c=vec3(.6,.7,.8);\n\
          float a=-.4;\n\
        float si=sin(a),co=cos(a);\n\
        uv*=mat2(co,-si,si,co);\n\
        uv*=length(uv+vec2(0,4.9))*.3+1.;\n\
         float v=1.-sin(hash(floor(uv.x*100.))*2.);\n\
        float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;\n\
        c*=v*b;\n\
        gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), 0.5);\n\
        }",
  });
  //3-获取黑夜实例
  // console.log(_viewer);
  // if (!staticParams.weatherInstance.night){
  //   _viewer.scene.light.color
  //   staticParams.weatherInstance.night = _viewer.scene.light;
  // }

  //4-获取云雾实例
  if (!staticParams.weatherInstance.fog) {
    staticParams.viewer.scene.fog.density = 0.0015;
    staticParams.weatherInstance.fog = staticParams.viewer.scene.fog;
  }

  //默认控制不显示天气效果
  staticParams.weatherInstance.rain.enabled = false; //下雨
  staticParams.weatherInstance.snow.enabled = false;
  staticParams.weatherInstance.fog.enabled = false;
  // staticParams.weatherIns

  //添加天气效果到三维场景中
  _viewer.scene.postProcessStages.add(staticParams.weatherInstance.rain);
  _viewer.scene.postProcessStages.add(staticParams.weatherInstance.snow);
}

/**************地形分析相关*****************/

/**************淹没分析相关*****************/
