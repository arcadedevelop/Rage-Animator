(() => {
  "use strict";

  let DESIGN_WIDTH = 1000;
  let DESIGN_HEIGHT = 650;
  const STORAGE_KEY = "astro-rooster-rig-editor-v3";
  const VIEW_STORAGE_KEY = "astro-rooster-rig-editor-camera-v1";
  const LABEL_WIDTH = 158;
  const TRANSFORM_PROPS = ["tx", "ty", "rz", "ry", "z", "scale"];
  const DEFAULT_TRANSFORM = Object.freeze({
    tx: 0,
    ty: 0,
    rz: 0,
    ry: 0,
    z: 0,
    scale: 1
  });

  /*
   * MAL — the original asset-based mount + rider. The images stay separated at
   * their real joints. Each child transform is evaluated inside its parent's
   * matrix, so moving a thigh also carries its shin, and moving the body
   * carries the complete rider/chicken hierarchy.
   */
  const MAL_BONES = [
    {
      id: "rooster-body",
      name: "Rooster Body",
      shortName: "Body",
      parent: null,
      asset: "bone-rig/rooster-body-v2.png",
      x: 505,
      y: 432,
      width: 300,
      height: 340,
      pivotX: 0.47,
      pivotY: 0.72,
      baseRz: 0,
      baseZ: 0,
      layer: -20
    },
    {
      id: "rooster-tail",
      name: "Rooster Tail",
      shortName: "Tail",
      parent: "rooster-body",
      asset: "bone-rig/rooster-tail.png",
      x: -105,
      y: -54,
      width: 170,
      height: 213,
      pivotX: 0.93,
      pivotY: 0.58,
      baseRz: -2,
      baseZ: -28,
      layer: -34
    },
    {
      id: "rooster-far-thigh",
      name: "Rooster Far Thigh",
      shortName: "Far Thigh",
      parent: "rooster-body",
      asset: "bone-rig/rooster-far-thigh.png",
      x: -36,
      y: 11,
      width: 22,
      height: 84,
      pivotX: 0.5,
      pivotY: 0.08,
      baseRz: 0,
      baseZ: -42,
      layer: -58
    },
    {
      id: "rooster-far-shin",
      name: "Rooster Far Shin + Foot",
      shortName: "Far Shin",
      parent: "rooster-far-thigh",
      asset: "bone-rig/rooster-far-shin.png",
      x: 0,
      y: 71,
      width: 82,
      height: 84,
      pivotX: 0.42,
      pivotY: 0.08,
      baseRz: 0,
      baseZ: -44,
      layer: -56
    },
    {
      id: "rooster-near-thigh",
      name: "Rooster Near Thigh",
      shortName: "Near Thigh",
      parent: "rooster-body",
      asset: "bone-rig/rooster-near-thigh.png",
      x: 31,
      y: 14,
      width: 23,
      height: 86,
      pivotX: 0.5,
      pivotY: 0.08,
      baseRz: 0,
      baseZ: 40,
      layer: -8
    },
    {
      id: "rooster-near-shin",
      name: "Rooster Near Shin + Foot",
      shortName: "Near Shin",
      parent: "rooster-near-thigh",
      asset: "bone-rig/rooster-near-shin.png",
      x: 0,
      y: 72,
      width: 84,
      height: 86,
      pivotX: 0.42,
      pivotY: 0.08,
      baseRz: 0,
      baseZ: 43,
      layer: -6
    },
    {
      id: "rider-root",
      name: "Rider Root",
      shortName: "Rider Root",
      parent: "rooster-body",
      asset: null,
      x: -8,
      y: -77,
      width: 26,
      height: 26,
      pivotX: 0.5,
      pivotY: 0.5,
      baseRz: 0,
      baseZ: 16,
      layer: -12
    },
    {
      id: "astronaut-core",
      name: "Astronaut Core",
      shortName: "Rider Core",
      parent: "rider-root",
      asset: "bone-rig/astronaut-core.png",
      x: 0,
      y: 0,
      width: 132,
      height: 212,
      pivotX: 0.5,
      pivotY: 0.94,
      baseRz: 0,
      baseZ: 0,
      layer: -12
    },
    {
      id: "astronaut-far-thigh",
      name: "Astronaut Far Thigh",
      shortName: "Rider Far Thigh",
      parent: "astronaut-core",
      asset: "bone-rig/astronaut-far-thigh.png",
      x: -20,
      y: -8,
      width: 38,
      height: 84,
      pivotX: 0.5,
      pivotY: 0.06,
      baseRz: 0,
      baseZ: -24,
      layer: -30
    },
    {
      id: "astronaut-far-shin",
      name: "Astronaut Far Shin",
      shortName: "Rider Far Shin",
      parent: "astronaut-far-thigh",
      asset: "bone-rig/astronaut-far-shin.png",
      x: 0,
      y: 69,
      width: 47,
      height: 75,
      pivotX: 0.22,
      pivotY: 0.06,
      baseRz: 0,
      baseZ: -26,
      layer: -28
    },
    {
      id: "astronaut-near-thigh",
      name: "Astronaut Near Thigh",
      shortName: "Rider Near Thigh",
      parent: "astronaut-core",
      asset: "bone-rig/astronaut-near-thigh.png",
      x: 17,
      y: -7,
      width: 41,
      height: 85,
      pivotX: 0.5,
      pivotY: 0.06,
      baseRz: 0,
      baseZ: 23,
      layer: 4
    },
    {
      id: "astronaut-near-shin",
      name: "Astronaut Near Shin",
      shortName: "Rider Near Shin",
      parent: "astronaut-near-thigh",
      asset: "bone-rig/astronaut-near-shin.png",
      x: 0,
      y: 70,
      width: 48,
      height: 76,
      pivotX: 0.22,
      pivotY: 0.06,
      baseRz: 0,
      baseZ: 25,
      layer: 6
    },
    {
      id: "astronaut-free-upper",
      name: "Astronaut Free Upper Arm",
      shortName: "Free Upper Arm",
      parent: "astronaut-core",
      asset: "bone-rig/astronaut-free-upper.png",
      x: -42,
      y: -113,
      width: 88,
      height: 48,
      pivotX: 0.06,
      pivotY: 0.5,
      baseRz: 132,
      baseZ: -8,
      layer: -16
    },
    {
      id: "astronaut-free-forearm",
      name: "Astronaut Free Forearm",
      shortName: "Free Forearm",
      parent: "astronaut-free-upper",
      asset: "bone-rig/astronaut-free-forearm.png",
      x: 75,
      y: 0,
      width: 74,
      height: 43,
      pivotX: 0.06,
      pivotY: 0.5,
      baseRz: 35,
      baseZ: -5,
      layer: -15
    },
    {
      id: "astronaut-torch-upper",
      name: "Astronaut Torch Upper Arm",
      shortName: "Torch Upper Arm",
      parent: "astronaut-core",
      asset: "bone-rig/astronaut-torch-upper.png",
      x: 39,
      y: -113,
      width: 88,
      height: 48,
      pivotX: 0.06,
      pivotY: 0.5,
      baseRz: -61,
      baseZ: 9,
      layer: 10
    },
    {
      id: "astronaut-torch-forearm",
      name: "Astronaut Torch Forearm",
      shortName: "Torch Forearm",
      parent: "astronaut-torch-upper",
      asset: "bone-rig/astronaut-torch-forearm.png",
      x: 75,
      y: 0,
      width: 106,
      height: 211,
      pivotX: 0.08,
      pivotY: 0.77,
      baseRz: 62,
      baseZ: 13,
      layer: 12
    }
  ];

  /*
   * ASTRA — a project-fit character rebuilt from scratch as pure vector shapes.
   * Every joint coordinate is exact and self-contained, so unlike the traced
   * MAL parts its body structure is precise and never depends on external art.
   * A lone space runner that matches the Astro-Rooster world.
   */
  const ASTRA_FILL = "#e9e4d6";
  const ASTRA_DARK = "#b3ab9a";
  const ASTRA_MID = "#cfc8b8";
  const ASTRA_STROKE = "#2b2620";
  const ASTRA_BONES = [
    {
      id: "astra-hip", name: "Astra Hip", shortName: "Hip", parent: null,
      x: 500, y: 452, width: 58, height: 42, pivotX: 0.5, pivotY: 0.45,
      baseRz: 0, baseZ: 0, layer: 0,
      shape: { kind: "capsule", fill: ASTRA_MID, stroke: ASTRA_STROKE, lineWidth: 3 }
    },
    {
      id: "astra-backpack", name: "Astra Backpack", shortName: "Backpack", parent: "astra-hip",
      x: -20, y: -34, width: 30, height: 56, pivotX: 0.5, pivotY: 0.28,
      baseRz: -4, baseZ: -14, layer: 1,
      shape: { kind: "rect", radius: 9, fill: "#8f8879", stroke: ASTRA_STROKE, lineWidth: 3, accent: "#ffad55" }
    },
    {
      id: "astra-torso", name: "Astra Torso", shortName: "Torso", parent: "astra-hip",
      x: 0, y: -8, width: 62, height: 106, pivotX: 0.5, pivotY: 0.9,
      baseRz: -5, baseZ: 0, layer: 2,
      shape: { kind: "torso", fill: ASTRA_FILL, stroke: ASTRA_STROKE, lineWidth: 3, accent: "#78d7e9", belt: "#ffad55" }
    },
    {
      id: "astra-head", name: "Astra Head", shortName: "Head", parent: "astra-torso",
      x: 1, y: -90, width: 58, height: 60, pivotX: 0.5, pivotY: 0.82,
      baseRz: 5, baseZ: 4, layer: 3,
      shape: { kind: "helmet", fill: "#eef0f2", stroke: ASTRA_STROKE, lineWidth: 3, visor: "#79d7e9" }
    },
    {
      id: "astra-far-thigh", name: "Astra Far Thigh", shortName: "Far Thigh", parent: "astra-hip",
      x: -6, y: 12, width: 23, height: 55, pivotX: 0.5, pivotY: 0.12,
      baseRz: 6, baseZ: -18, layer: -6,
      shape: { kind: "capsule", fill: ASTRA_DARK, stroke: ASTRA_STROKE, lineWidth: 3 }
    },
    {
      id: "astra-far-shin", name: "Astra Far Shin", shortName: "Far Shin", parent: "astra-far-thigh",
      x: 0, y: 50, width: 19, height: 54, pivotX: 0.5, pivotY: 0.09,
      baseRz: -6, baseZ: -20, layer: -5,
      shape: { kind: "shin", fill: ASTRA_DARK, stroke: ASTRA_STROKE, lineWidth: 3, boot: "#3a2f27" }
    },
    {
      id: "astra-near-thigh", name: "Astra Near Thigh", shortName: "Near Thigh", parent: "astra-hip",
      x: 10, y: 12, width: 25, height: 57, pivotX: 0.5, pivotY: 0.12,
      baseRz: 2, baseZ: 20, layer: 6,
      shape: { kind: "capsule", fill: ASTRA_FILL, stroke: ASTRA_STROKE, lineWidth: 3 }
    },
    {
      id: "astra-near-shin", name: "Astra Near Shin", shortName: "Near Shin", parent: "astra-near-thigh",
      x: 0, y: 52, width: 20, height: 56, pivotX: 0.5, pivotY: 0.09,
      baseRz: -4, baseZ: 22, layer: 7,
      shape: { kind: "shin", fill: ASTRA_MID, stroke: ASTRA_STROKE, lineWidth: 3, boot: "#3a2f27" }
    },
    {
      id: "astra-far-upper", name: "Astra Far Upper Arm", shortName: "Far Upper", parent: "astra-torso",
      x: -8, y: -76, width: 19, height: 45, pivotX: 0.5, pivotY: 0.14,
      baseRz: 24, baseZ: -14, layer: -4,
      shape: { kind: "capsule", fill: ASTRA_DARK, stroke: ASTRA_STROKE, lineWidth: 3 }
    },
    {
      id: "astra-far-fore", name: "Astra Far Forearm", shortName: "Far Fore", parent: "astra-far-upper",
      x: 0, y: 40, width: 16, height: 42, pivotX: 0.5, pivotY: 0.1,
      baseRz: 16, baseZ: -16, layer: -3,
      shape: { kind: "hand", fill: ASTRA_DARK, stroke: ASTRA_STROKE, lineWidth: 3, glove: "#b3ab9a" }
    },
    {
      id: "astra-near-upper", name: "Astra Near Upper Arm", shortName: "Near Upper", parent: "astra-torso",
      x: 8, y: -76, width: 21, height: 47, pivotX: 0.5, pivotY: 0.14,
      baseRz: -22, baseZ: 14, layer: 8,
      shape: { kind: "capsule", fill: ASTRA_FILL, stroke: ASTRA_STROKE, lineWidth: 3 }
    },
    {
      id: "astra-near-fore", name: "Astra Near Forearm", shortName: "Near Fore", parent: "astra-near-upper",
      x: 0, y: 42, width: 17, height: 44, pivotX: 0.5, pivotY: 0.1,
      baseRz: -14, baseZ: 16, layer: 9,
      shape: { kind: "hand", fill: ASTRA_MID, stroke: ASTRA_STROKE, lineWidth: 3, glove: "#e2ddce" }
    }
  ];

  /*
   * EMBER — a lightweight rescue scout built for the Chicken Run story world.
   * The larger joint spacing keeps every handle easy to select on phones, while
   * the separate cape and wrist beacon add story-ready secondary animation.
   */
  const EMBER_IVORY = "#f1e7cf";
  const EMBER_ORANGE = "#ef6a32";
  const EMBER_TEAL = "#47c8bd";
  const EMBER_DARK = "#302b2b";
  const EMBER_SHADOW = "#9f4930";
  const EMBER_BONES = [
    {
      id: "ember-hip", name: "Ember Hip", shortName: "Hip", parent: null,
      x: 500, y: 448, width: 62, height: 44, pivotX: 0.5, pivotY: 0.45,
      baseRz: 0, baseZ: 0, layer: 0,
      shape: { kind: "capsule", fill: EMBER_SHADOW, stroke: EMBER_DARK, lineWidth: 3 }
    },
    {
      id: "ember-pack", name: "Ember Rescue Pack", shortName: "Rescue Pack", parent: "ember-hip",
      x: -24, y: -38, width: 38, height: 70, pivotX: 0.52, pivotY: 0.25,
      baseRz: -8, baseZ: -18, layer: -8,
      shape: { kind: "rect", radius: 10, fill: "#6d5550", stroke: EMBER_DARK, lineWidth: 3, accent: EMBER_TEAL }
    },
    {
      id: "ember-torso", name: "Ember Rescue Torso", shortName: "Torso", parent: "ember-hip",
      x: 0, y: -8, width: 70, height: 112, pivotX: 0.5, pivotY: 0.9,
      baseRz: -8, baseZ: 0, layer: 2,
      shape: {
        kind: "rescue-torso", fill: EMBER_IVORY, stroke: EMBER_DARK, lineWidth: 3,
        accent: EMBER_TEAL, belt: EMBER_ORANGE
      }
    },
    {
      id: "ember-cape", name: "Ember Heat Cape", shortName: "Heat Cape", parent: "ember-torso",
      x: -11, y: -80, width: 64, height: 116, pivotX: 0.68, pivotY: 0.06,
      baseRz: 10, baseZ: -26, layer: -7,
      shape: { kind: "cape", fill: "#a83f2d", stroke: EMBER_DARK, lineWidth: 3, accent: "#ffb15b" }
    },
    {
      id: "ember-head", name: "Ember Rescue Helmet", shortName: "Helmet", parent: "ember-torso",
      x: 2, y: -95, width: 64, height: 66, pivotX: 0.5, pivotY: 0.82,
      baseRz: 8, baseZ: 5, layer: 4,
      shape: {
        kind: "rescue-helmet", fill: "#f6ead1", stroke: EMBER_DARK, lineWidth: 3,
        visor: "#50c8c8", accent: EMBER_ORANGE
      }
    },
    {
      id: "ember-far-thigh", name: "Ember Far Thigh", shortName: "Far Thigh", parent: "ember-hip",
      x: -8, y: 14, width: 24, height: 58, pivotX: 0.5, pivotY: 0.12,
      baseRz: 8, baseZ: -20, layer: -6,
      shape: { kind: "capsule", fill: EMBER_SHADOW, stroke: EMBER_DARK, lineWidth: 3 }
    },
    {
      id: "ember-far-shin", name: "Ember Far Shin", shortName: "Far Shin", parent: "ember-far-thigh",
      x: 0, y: 52, width: 20, height: 57, pivotX: 0.5, pivotY: 0.09,
      baseRz: -10, baseZ: -22, layer: -5,
      shape: { kind: "shin", fill: "#bb6245", stroke: EMBER_DARK, lineWidth: 3, boot: "#312a2b" }
    },
    {
      id: "ember-near-thigh", name: "Ember Near Thigh", shortName: "Near Thigh", parent: "ember-hip",
      x: 11, y: 14, width: 26, height: 60, pivotX: 0.5, pivotY: 0.12,
      baseRz: 3, baseZ: 22, layer: 7,
      shape: { kind: "capsule", fill: EMBER_ORANGE, stroke: EMBER_DARK, lineWidth: 3 }
    },
    {
      id: "ember-near-shin", name: "Ember Near Shin", shortName: "Near Shin", parent: "ember-near-thigh",
      x: 0, y: 54, width: 21, height: 59, pivotX: 0.5, pivotY: 0.09,
      baseRz: -7, baseZ: 24, layer: 8,
      shape: { kind: "shin", fill: "#e88854", stroke: EMBER_DARK, lineWidth: 3, boot: "#312a2b" }
    },
    {
      id: "ember-far-upper", name: "Ember Far Upper Arm", shortName: "Far Upper", parent: "ember-torso",
      x: -11, y: -78, width: 20, height: 48, pivotX: 0.5, pivotY: 0.14,
      baseRz: 26, baseZ: -16, layer: -4,
      shape: { kind: "capsule", fill: EMBER_SHADOW, stroke: EMBER_DARK, lineWidth: 3 }
    },
    {
      id: "ember-far-fore", name: "Ember Far Forearm", shortName: "Far Forearm", parent: "ember-far-upper",
      x: 0, y: 43, width: 18, height: 46, pivotX: 0.5, pivotY: 0.1,
      baseRz: 18, baseZ: -18, layer: -3,
      shape: { kind: "hand", fill: "#b45b41", stroke: EMBER_DARK, lineWidth: 3, glove: "#6b4a42" }
    },
    {
      id: "ember-near-upper", name: "Ember Near Upper Arm", shortName: "Near Upper", parent: "ember-torso",
      x: 12, y: -78, width: 22, height: 50, pivotX: 0.5, pivotY: 0.14,
      baseRz: -24, baseZ: 16, layer: 10,
      shape: { kind: "capsule", fill: EMBER_ORANGE, stroke: EMBER_DARK, lineWidth: 3 }
    },
    {
      id: "ember-near-fore", name: "Ember Near Forearm", shortName: "Near Forearm", parent: "ember-near-upper",
      x: 0, y: 45, width: 19, height: 47, pivotX: 0.5, pivotY: 0.1,
      baseRz: -16, baseZ: 18, layer: 11,
      shape: { kind: "hand", fill: "#e88854", stroke: EMBER_DARK, lineWidth: 3, glove: EMBER_IVORY }
    },
    {
      id: "ember-beacon", name: "Ember Wrist Beacon", shortName: "Wrist Beacon", parent: "ember-near-fore",
      x: 0, y: 38, width: 28, height: 31, pivotX: 0.5, pivotY: 0.18,
      baseRz: -4, baseZ: 25, layer: 13,
      shape: {
        kind: "beacon", fill: "#413a3b", stroke: EMBER_DARK, lineWidth: 3,
        accent: EMBER_TEAL, glow: "#c9fff2"
      }
    }
  ];

  /*
   * TROLLER — a comic troll-faced dancer on an intentionally simple stick rig.
   * The face is drawn procedurally, while every arm and leg segment remains a
   * separate editable bone for broad, readable dance poses.
  */
  const TROLLER_INK = "#171515";
  const TROLLER_BONES = [
    {
      id: "troller-hip", name: "Troller Hip", shortName: "Hip", parent: null,
      x: 500, y: 430, width: 18, height: 18, pivotX: 0.5, pivotY: 0.5,
      baseRz: 0, baseZ: 0, layer: 0,
      shape: { kind: "stick-joint", fill: TROLLER_INK, stroke: TROLLER_INK, lineWidth: 7 }
    },
    {
      id: "troller-torso", name: "Troller Stick Torso", shortName: "Torso", parent: "troller-hip",
      x: 0, y: 0, width: 42, height: 94, pivotX: 0.5, pivotY: 0.94,
      baseRz: 0, baseZ: 0, layer: 2,
      shape: { kind: "stick-torso", fill: TROLLER_INK, stroke: TROLLER_INK, lineWidth: 7 }
    },
    {
      id: "troller-head", name: "Troller Troll Face", shortName: "Troll Face", parent: "troller-torso",
      asset: "rig-editor/assets/troller-face-768.png",
      x: 0, y: -81, width: 170, height: 136, pivotX: 0.5, pivotY: 0.78,
      baseRz: 0, baseZ: 8, layer: 6,
      shape: { kind: "troll-face", fill: "#f3efdf", stroke: TROLLER_INK, lineWidth: 4 }
    },
    {
      id: "troller-far-thigh", name: "Troller Far Thigh", shortName: "Far Thigh", parent: "troller-hip",
      x: -7, y: 7, width: 14, height: 64, pivotX: 0.5, pivotY: 0.08,
      baseRz: 0, baseZ: -18, layer: -6,
      shape: { kind: "stick-limb", fill: TROLLER_INK, stroke: TROLLER_INK, lineWidth: 7 }
    },
    {
      id: "troller-far-shin", name: "Troller Far Shin", shortName: "Far Shin", parent: "troller-far-thigh",
      x: 0, y: 58, width: 13, height: 70, pivotX: 0.5, pivotY: 0.08,
      baseRz: 0, baseZ: -20, layer: -5,
      shape: { kind: "stick-limb", fill: TROLLER_INK, stroke: TROLLER_INK, lineWidth: 7, foot: true }
    },
    {
      id: "troller-near-thigh", name: "Troller Near Thigh", shortName: "Near Thigh", parent: "troller-hip",
      x: 7, y: 7, width: 14, height: 64, pivotX: 0.5, pivotY: 0.08,
      baseRz: 0, baseZ: 18, layer: 7,
      shape: { kind: "stick-limb", fill: TROLLER_INK, stroke: TROLLER_INK, lineWidth: 7 }
    },
    {
      id: "troller-near-shin", name: "Troller Near Shin", shortName: "Near Shin", parent: "troller-near-thigh",
      x: 0, y: 58, width: 13, height: 70, pivotX: 0.5, pivotY: 0.08,
      baseRz: 0, baseZ: 20, layer: 8,
      shape: { kind: "stick-limb", fill: TROLLER_INK, stroke: TROLLER_INK, lineWidth: 7, foot: true }
    },
    {
      id: "troller-far-upper", name: "Troller Far Upper Arm", shortName: "Far Upper", parent: "troller-torso",
      x: -11, y: -72, width: 12, height: 44, pivotX: 0.5, pivotY: 0.08,
      baseRz: 0, baseZ: -16, layer: -4,
      shape: { kind: "stick-limb", fill: TROLLER_INK, stroke: TROLLER_INK, lineWidth: 7 }
    },
    {
      id: "troller-far-fore", name: "Troller Far Forearm", shortName: "Far Forearm", parent: "troller-far-upper",
      x: 0, y: 40, width: 11, height: 38, pivotX: 0.5, pivotY: 0.08,
      baseRz: 0, baseZ: -18, layer: -3,
      shape: { kind: "stick-limb", fill: TROLLER_INK, stroke: TROLLER_INK, lineWidth: 7, hand: true }
    },
    {
      id: "troller-near-upper", name: "Troller Near Upper Arm", shortName: "Near Upper", parent: "troller-torso",
      x: 11, y: -72, width: 12, height: 44, pivotX: 0.5, pivotY: 0.08,
      baseRz: 0, baseZ: 16, layer: 10,
      shape: { kind: "stick-limb", fill: TROLLER_INK, stroke: TROLLER_INK, lineWidth: 7 }
    },
    {
      id: "troller-near-fore", name: "Troller Near Forearm", shortName: "Near Forearm", parent: "troller-near-upper",
      x: 0, y: 40, width: 11, height: 38, pivotX: 0.5, pivotY: 0.08,
      baseRz: 0, baseZ: 18, layer: 11,
      shape: { kind: "stick-limb", fill: TROLLER_INK, stroke: TROLLER_INK, lineWidth: 7, hand: true }
    }
  ];

  // A character is a self-contained rig definition. "asset" characters draw PNG
  // parts (the original MAL rig); "vector" characters draw procedurally.
  const MAL_CHARACTER = {
    id: "mal", name: "MAL", kind: "asset", builtin: true,
    designWidth: 1000, designHeight: 650, rootId: "rooster-body",
    ground: { y: 566, rx: 122, ry: 20 }, scene: "mal-village",
    bones: MAL_BONES, buildTracks: createMalTracks
  };
  const ASTRA_CHARACTER = {
    id: "astra", name: "Astra", kind: "vector", builtin: true,
    designWidth: 1000, designHeight: 650, rootId: "astra-hip",
    ground: { y: 566, rx: 62, ry: 13 }, scene: "deep-space",
    bones: ASTRA_BONES, buildTracks: createAstraTracks
  };
  const EMBER_CHARACTER = {
    id: "ember", name: "Ember", kind: "vector", builtin: true,
    designWidth: 1000, designHeight: 650, rootId: "ember-hip",
    defaultDuration: 1666.667, defaultClipId: "rescue-run", defaultClipName: "Rescue Run",
    ground: { y: 566, rx: 68, ry: 14 }, scene: "ashfall-outpost",
    bones: EMBER_BONES, buildTracks: createEmberTracks
  };
  const TROLLER_CHARACTER = {
    id: "troller-classic", name: "Troller", kind: "asset", builtin: true,
    designWidth: 1000, designHeight: 650, rootId: "troller-hip",
    defaultDuration: 833.333, defaultClipId: "classic-troll-dance", defaultClipName: "Classic Troll Dance",
    ground: { y: 566, rx: 72, ry: 13 }, scene: "studio",
    bones: TROLLER_BONES, buildTracks: createTrollerTracks
  };
  const BUILTIN_CHARACTERS = [MAL_CHARACTER, ASTRA_CHARACTER, EMBER_CHARACTER, TROLLER_CHARACTER];

  const BUILTIN_SCENES = [
    {
      id: "mal-village", name: "MAL Village", builtin: true,
      image: "chickenrun-background-lite.webp",
      filter: "saturate(.92) brightness(.69) contrast(1.05)"
    },
    {
      id: "deep-space", name: "Deep Space", builtin: true, image: null,
      css: "radial-gradient(circle at 50% 26%, #23324e 0%, #0d1526 52%, #05070d 100%)",
      stars: true, filter: "none"
    },
    {
      id: "ashfall-outpost", name: "Ashfall Outpost", builtin: true, image: null,
      css: "radial-gradient(circle at 73% 70%, rgba(255,111,48,.72) 0 2%, transparent 17%), radial-gradient(circle at 22% 78%, rgba(217,69,38,.48) 0 3%, transparent 20%), radial-gradient(circle at 50% 110%, #6f271f 0 18%, transparent 48%), linear-gradient(180deg, #342b39 0%, #241d27 48%, #120d12 100%)",
      stars: false, filter: "none"
    },
    {
      id: "plain-white", name: "Plain White", builtin: true, image: null,
      css: "none", color: "#ffffff", stars: false, filter: "none"
    },
    {
      id: "solid-color", name: "Custom One Color", builtin: true, image: null,
      css: "none", color: null, stars: false, filter: "none"
    },
    {
      id: "studio", name: "Studio Grey", builtin: true, image: null,
      css: "linear-gradient(180deg, #2c2824 0%, #17130f 100%)", filter: "none"
    }
  ];

  const BUILTIN_KEYFRAME_SETS = [
    {
      id: "preset-run", name: "Run Cycle", builtin: true, generatorId: "run",
      duration: 1600, snapFps: 12, description: "Fast alternating legs, counter-swinging arms, and a double body bob."
    },
    {
      id: "preset-jump", name: "Jump", builtin: true, generatorId: "jump",
      duration: 1200, snapFps: 12, description: "Anticipation, takeoff, airborne apex, fall, and soft landing."
    },
    {
      id: "preset-idle", name: "Idle Breathing", builtin: true, generatorId: "idle",
      duration: 2000, snapFps: 12, description: "Subtle breathing, head drift, and secondary accessory motion."
    },
    {
      id: "preset-walk", name: "Walk Cycle", builtin: true, generatorId: "walk",
      duration: 2000, snapFps: 12, description: "Slower heel-to-toe steps with gentle arm counter-swing."
    },
    {
      id: "preset-wave", name: "Wave", builtin: true, generatorId: "wave",
      duration: 1600, snapFps: 12, description: "One raised arm waves while the body balances underneath."
    },
    {
      id: "preset-crouch", name: "Crouch & Stand", builtin: true, generatorId: "crouch",
      duration: 1400, snapFps: 12, description: "Readable down pose, held crouch, and controlled recovery."
    },
    {
      id: "preset-kick", name: "Forward Kick", builtin: true, generatorId: "kick",
      duration: 1200, snapFps: 12, description: "Load the hips, extend a foreground kick, retract, and recover."
    },
    {
      id: "preset-celebrate", name: "Celebrate", builtin: true, generatorId: "celebrate",
      duration: 1800, snapFps: 12, description: "Both arms lift with two buoyant victory hops."
    },
    {
      id: "preset-look", name: "Look Around", builtin: true, generatorId: "look",
      duration: 1800, snapFps: 12, description: "Head and torso scan left, center, and right in 2.5D."
    },
    {
      id: "preset-dance", name: "Dance Groove", builtin: true, generatorId: "dance",
      duration: 2000, snapFps: 12, description: "Side-to-side hips, alternating knees, arm waves, and head bounce."
    },
    {
      id: "preset-troll-dance", name: "Troll Dance", builtin: true, generatorId: "trollDance",
      duration: 2000, snapFps: 12, description: "Trollface groove that flails side-to-side, then whips into a full 360° spin with a hop and squash-and-stretch before looping seamlessly."
    }
  ];

  let bones = MAL_BONES;
  let boneById = new Map();
  let childrenByParent = new Map();

  function indexBones(list) {
    boneById = new Map(list.map((bone) => [bone.id, bone]));
    childrenByParent = new Map();
    list.forEach((bone) => {
      if (!childrenByParent.has(bone.parent)) {
        childrenByParent.set(bone.parent, []);
      }
      childrenByParent.get(bone.parent).push(bone);
    });
  }
  indexBones(bones);

  const dom = {
    canvas: document.getElementById("rigCanvas"),
    stageShell: document.getElementById("stageShell"),
    stageLoading: document.getElementById("stageLoading"),
    interactionDock: document.getElementById("interactionDock"),
    rigToolButtons: [...document.querySelectorAll("[data-tool]")],
    gestureReadout: document.getElementById("gestureReadout"),
    controlHelpButton: document.getElementById("controlHelpButton"),
    controlCoach: document.getElementById("controlCoach"),
    closeControlCoach: document.getElementById("closeControlCoach"),
    zoomOutButton: document.getElementById("zoomOutButton"),
    zoomInButton: document.getElementById("zoomInButton"),
    fitCameraButton: document.getElementById("fitCameraButton"),
    cameraZoomLevel: document.getElementById("cameraZoomLevel"),
    mobileAddKeyButton: document.getElementById("mobileAddKeyButton"),
    mobileScrollButtons: [...document.querySelectorAll("[data-scroll-target]")],
    boneList: document.getElementById("boneList"),
    boneCount: document.getElementById("boneCount"),
    selectedBoneName: document.getElementById("selectedBoneName"),
    selectedStatus: document.getElementById("selectedStatus"),
    renderStatus: document.getElementById("renderStatus"),
    playButton: document.getElementById("playButton"),
    playIcon: document.getElementById("playIcon"),
    stopButton: document.getElementById("stopButton"),
    undoButton: document.getElementById("undoButton"),
    redoButton: document.getElementById("redoButton"),
    timecode: document.getElementById("timecode"),
    saveState: document.getElementById("saveState"),
    importButton: document.getElementById("importButton"),
    importInput: document.getElementById("importInput"),
    exportButton: document.getElementById("exportButton"),
    skeletonToggle: document.getElementById("skeletonToggle"),
    onionToggle: document.getElementById("onionToggle"),
    aiAssistToggle: document.getElementById("aiAssistToggle"),
    gridToggle: document.getElementById("gridToggle"),
    autoKeyToggle: document.getElementById("autoKeyToggle"),
    addKeyButton: document.getElementById("addKeyButton"),
    deleteKeyButton: document.getElementById("deleteKeyButton"),
    resetTransformButton: document.getElementById("resetTransformButton"),
    layerDownButton: document.getElementById("layerDownButton"),
    layerUpButton: document.getElementById("layerUpButton"),
    autoOrientPathToggle: document.getElementById("autoOrientPathToggle"),
    pathAngleOffset: document.getElementById("pathAngleOffset"),
    pathAngleOffsetOutput: document.getElementById("pathAngleOffsetOutput"),
    orientPathButton: document.getElementById("orientPathButton"),
    durationInput: document.getElementById("durationInput"),
    snapSelect: document.getElementById("snapSelect"),
    previousKeyButton: document.getElementById("previousKeyButton"),
    nextKeyButton: document.getElementById("nextKeyButton"),
    timelineScrubber: document.getElementById("timelineScrubber"),
    durationLabel: document.getElementById("durationLabel"),
    timelineRuler: document.getElementById("timelineRuler"),
    tracksBody: document.getElementById("tracksBody"),
    tracksScroll: document.getElementById("tracksScroll"),
    timelinePlayhead: document.getElementById("timelinePlayhead"),
    frameReadout: document.getElementById("frameReadout"),
    keyCountStatus: document.getElementById("keyCountStatus"),
    propertyInputs: [...document.querySelectorAll("[data-prop]")],
    propertyOutputs: [...document.querySelectorAll("[data-output]")],
    activeClipLabel: document.getElementById("activeClipLabel"),
    clipTabs: document.getElementById("clipTabs"),
    newClipButton: document.getElementById("newClipButton"),
    duplicateClipButton: document.getElementById("duplicateClipButton"),
    renameClipButton: document.getElementById("renameClipButton"),
    deleteClipButton: document.getElementById("deleteClipButton"),
    sceneArt: document.getElementById("sceneArt"),
    characterSelect: document.getElementById("characterSelect"),
    sceneSelect: document.getElementById("sceneSelect"),
    keyframeSetSelect: document.getElementById("keyframeSetSelect"),
    newCharacterButton: document.getElementById("newCharacterButton"),
    renameCharacterButton: document.getElementById("renameCharacterButton"),
    deleteCharacterButton: document.getElementById("deleteCharacterButton"),
    addSceneButton: document.getElementById("addSceneButton"),
    deleteSceneButton: document.getElementById("deleteSceneButton"),
    sceneImageInput: document.getElementById("sceneImageInput"),
    sceneColorInput: document.getElementById("sceneColorInput"),
    useSolidColorButton: document.getElementById("useSolidColorButton"),
    applyKeyframeSetButton: document.getElementById("applyKeyframeSetButton"),
    saveKeyframeSetButton: document.getElementById("saveKeyframeSetButton"),
    exportKeyframeSetButton: document.getElementById("exportKeyframeSetButton"),
    importKeyframeSetButton: document.getElementById("importKeyframeSetButton"),
    deleteKeyframeSetButton: document.getElementById("deleteKeyframeSetButton"),
    keyframeSetInput: document.getElementById("keyframeSetInput")
  };

  const ctx = dom.canvas.getContext("2d", {
    alpha: true,
    desynchronized: true
  });

  const state = {
    duration: 1600,
    snapFps: 12,
    currentTime: 0,
    selectedBoneId: "rooster-body",
    character: MAL_CHARACTER,
    sceneId: "mal-village",
    sceneColor: "#d9d2c5",
    userCharacters: [],
    userScenes: [],
    userKeyframeSets: [],
    activeKeyframeSetId: "preset-run",
    projects: {},
    clips: [],
    activeClipId: "run-cycle",
    tracks: createMalTracks(),
    previewOverrides: {},
    images: new Map(),
    imageFailures: 0,
    matrices: new Map(),
    view: {
      width: 0,
      height: 0,
      dpr: 1,
      fitScale: 1,
      fitOffsetX: 0,
      fitOffsetY: 0,
      scale: 1,
      offsetX: 0,
      offsetY: 0
    },
    camera: {
      zoom: 1,
      panX: 0,
      panY: 0
    },
    showSkeleton: true,
    showOnion: false,
    aiAssist: false,
    sliderBaseline: null,
    showControlCoach: true,
    currentTool: "move",
    autoOrientPath: false,
    pathAngleOffset: 0,
    isPlaying: false,
    playStart: 0,
    dirty: true,
    rafId: 0,
    lastUiUpdate: 0,
    undoStack: [],
    redoStack: [],
    sliderSnapshot: null,
    drag: null,
    activePointers: new Map(),
    multiGesture: null,
    cameraPointers: new Map(),
    cameraGesture: null,
    cameraSaveTimer: 0,
    saveTimer: 0
  };

  function transform(values = {}) {
    return {
      tx: finiteOr(values.tx, 0),
      ty: finiteOr(values.ty, 0),
      rz: finiteOr(values.rz, 0),
      ry: finiteOr(values.ry, 0),
      z: finiteOr(values.z, 0),
      scale: clamp(finiteOr(values.scale, 1), 0.1, 4)
    };
  }

  function finiteOr(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function degToRad(value) {
    return value * Math.PI / 180;
  }

  function smoothstep(value) {
    return value * value * (3 - 2 * value);
  }

  function shortestAngleDelta(from, to) {
    return ((to - from + 540) % 360) - 180;
  }

  function lerpTransform(from, to, amount) {
    const eased = smoothstep(clamp(amount, 0, 1));
    const output = {};
    TRANSFORM_PROPS.forEach((prop) => {
      if (prop === "rz" || prop === "ry") {
        output[prop] = from[prop] + shortestAngleDelta(from[prop], to[prop]) * eased;
      } else {
        output[prop] = from[prop] + (to[prop] - from[prop]) * eased;
      }
    });
    return output;
  }

  function keySeries(valuesByPose) {
    const times = [0, 200, 400, 600, 800, 1000, 1200, 1400];
    return times.map((time, index) => ({
      time,
      values: transform(valuesByPose(index))
    }));
  }

  function createMalTracks() {
    // The chicken is a galloping mount: its two legs alternate 180° out of
    // phase, the body double-bobs (one dip per foot contact) and the tail
    // counter-swings. The astronaut does NOT run — it is seated, gripping the
    // mount with bent legs while a springy rider-root absorbs the bounce.
    const rootX = [0, 2, 4, 2, 0, -2, -4, -2];
    const rootY = [0, -12, -18, -12, 0, -12, -18, -12];
    const rootRz = [1, 0, -1, -0.5, 1, 0, -1, -0.5];
    const bodyRy = [-2, 0, 2, 0, -2, 0, 2, 0];

    // Chicken legs — full gallop cycle (far leg = near leg shifted half a loop).
    const nearHip = [-38, -24, -5, 22, 42, 24, -12, -36];
    const nearKnee = [10, 14, 26, 36, 74, 82, 64, 28];
    const farHip = [42, 24, -12, -36, -38, -24, -5, 22];
    const farKnee = [74, 82, 64, 28, 10, 14, 26, 36];

    // Rider springy root — small counter-bob so the pilot rides steadier than
    // the mount (absorbs part of the vertical throw) with a light lean sway.
    const riderRootY = [0, 4, 6, 4, 0, 4, 6, 4];
    const riderRootX = [0, 1, 0, -1, 0, 1, 0, -1];
    const riderRootRz = [1, 0, -1.5, -0.5, 1, 0, -1.5, -0.5];

    // Rider torso — subtle secondary compression and forward-lean sway.
    const riderCoreY = [0, -2, -3, -2, 0, -2, -3, -2];
    const riderCoreRz = [2, 1, -1, 0, 2, 1, -1, 0];
    const riderCoreRy = [1, 0, -1, 0, 1, 0, -1, 0];

    // Rider legs — held in a seated grip (forward-bent thigh, tucked shin)
    // with only a small bounce; they never swing like a run cycle.
    const riderNearThigh = [19, 22, 24, 22, 19, 22, 24, 22];
    const riderNearShin = [32, 34, 36, 34, 32, 34, 36, 34];
    const riderFarThigh = [14, 16, 18, 16, 14, 16, 18, 16];
    const riderFarShin = [28, 30, 32, 30, 28, 30, 32, 30];

    // Rider arms — the free hand grips the reins near the neck (nearly planted);
    // the torch arm stays raised and sways gently with the gallop.
    const freeUpper = [0, 1, 2, 1, 0, -1, -2, -1];
    const freeForearm = [0, -1, -1.5, -1, 0, 1, 1.5, 1];
    const torchUpper = [0, 3, 5, 3, 0, -3, -5, -3];
    const torchForearm = [0, -2, -3, -2, 0, 2, 3, 2];

    const tracks = {};

    tracks["rooster-body"] = keySeries((index) => ({
      tx: rootX[index],
      ty: rootY[index],
      rz: rootRz[index],
      ry: bodyRy[index]
    }));
    tracks["rooster-tail"] = keySeries((index) => ({
      rz: [-2, 3, 6, 4, -2, -4, -7, -4][index]
    }));
    tracks["rooster-far-thigh"] = keySeries((index) => ({
      rz: farHip[index],
      ry: [-8, -4, 0, 4, 8, 4, 0, -4][index],
      z: [-5, -2, 2, 6, 8, 5, 0, -4][index]
    }));
    tracks["rooster-far-shin"] = keySeries((index) => ({
      rz: farKnee[index]
    }));
    tracks["rooster-near-thigh"] = keySeries((index) => ({
      rz: nearHip[index],
      ry: [8, 4, 0, -4, -8, -4, 0, 4][index],
      z: [8, 5, 0, -4, -5, -2, 2, 6][index]
    }));
    tracks["rooster-near-shin"] = keySeries((index) => ({
      rz: nearKnee[index]
    }));
    tracks["rider-root"] = keySeries((index) => ({
      tx: riderRootX[index],
      ty: riderRootY[index],
      rz: riderRootRz[index]
    }));
    tracks["astronaut-core"] = keySeries((index) => ({
      ty: riderCoreY[index],
      rz: riderCoreRz[index],
      ry: riderCoreRy[index]
    }));
    tracks["astronaut-far-thigh"] = keySeries((index) => ({
      rz: riderFarThigh[index]
    }));
    tracks["astronaut-far-shin"] = keySeries((index) => ({
      rz: riderFarShin[index]
    }));
    tracks["astronaut-near-thigh"] = keySeries((index) => ({
      rz: riderNearThigh[index]
    }));
    tracks["astronaut-near-shin"] = keySeries((index) => ({
      rz: riderNearShin[index]
    }));
    tracks["astronaut-free-upper"] = keySeries((index) => ({
      rz: freeUpper[index]
    }));
    tracks["astronaut-free-forearm"] = keySeries((index) => ({
      rz: freeForearm[index]
    }));
    tracks["astronaut-torch-upper"] = keySeries((index) => ({
      rz: torchUpper[index]
    }));
    tracks["astronaut-torch-forearm"] = keySeries((index) => ({
      rz: torchForearm[index]
    }));
    return tracks;
  }

  function createAstraTracks() {
    // A clean humanoid run: legs alternate 180° out of phase, arms counter-swing
    // to the opposite leg, the hips double-bob and the torso leans into the run
    // while the helmet stays level.
    const hipTy = [0, -8, -12, -8, 0, -8, -12, -8];
    const hipTx = [0, 1, 2, 1, 0, -1, -2, -1];
    const hipRz = [1, 0, -1, 0, 1, 0, -1, 0];
    const backpackRz = [0, -1, -1, 0, 1, 1, 0, -1];
    const torsoRz = [0, -2, -3, -1, 1, 2, 1, -1];
    const torsoTy = [0, -2, -3, -2, 0, -2, -3, -2];
    const headRz = [0, 1, 2, 1, -1, -2, -1, 0];

    const nearThigh = [10, 30, 34, 14, -16, -30, -22, -4];
    const nearShin = [30, 18, 8, 24, 55, 62, 52, 40];
    const farThigh = [-16, -30, -22, -4, 10, 30, 34, 14];
    const farShin = [55, 62, 52, 40, 30, 18, 8, 24];

    const nearUpper = [-10, -30, -34, -14, 16, 30, 22, 4];
    const nearFore = [-6, -2, 2, -4, -12, -16, -10, -4];
    const farUpper = [16, 30, 22, 4, -10, -30, -34, -14];
    const farFore = [-12, -16, -10, -4, -6, -2, 2, -4];

    const tracks = {};
    tracks["astra-hip"] = keySeries((i) => ({ tx: hipTx[i], ty: hipTy[i], rz: hipRz[i] }));
    tracks["astra-backpack"] = keySeries((i) => ({ rz: backpackRz[i] }));
    tracks["astra-torso"] = keySeries((i) => ({ ty: torsoTy[i], rz: torsoRz[i] }));
    tracks["astra-head"] = keySeries((i) => ({ rz: headRz[i] }));
    tracks["astra-far-thigh"] = keySeries((i) => ({ rz: farThigh[i] }));
    tracks["astra-far-shin"] = keySeries((i) => ({ rz: farShin[i] }));
    tracks["astra-near-thigh"] = keySeries((i) => ({ rz: nearThigh[i] }));
    tracks["astra-near-shin"] = keySeries((i) => ({ rz: nearShin[i] }));
    tracks["astra-far-upper"] = keySeries((i) => ({ rz: farUpper[i] }));
    tracks["astra-far-fore"] = keySeries((i) => ({ rz: farFore[i] }));
    tracks["astra-near-upper"] = keySeries((i) => ({ rz: nearUpper[i] }));
    tracks["astra-near-fore"] = keySeries((i) => ({ rz: nearFore[i] }));
    return tracks;
  }

  function createEmberTracks() {
    // Twenty authored poses at exactly 12 FPS make a deliberately slower,
    // story-friendly 1.667 second rescue run. Sine-derived values keep the loop
    // continuous while every frame remains exposed and editable in the timeline.
    const frameCount = 20;
    const series = (valuesByFrame) => Array.from({ length: frameCount }, (_, frame) => {
      const phase = frame / frameCount * Math.PI * 2;
      return {
        time: Math.round((frame * 1000 / 12) * 1000) / 1000,
        values: transform(valuesByFrame(frame, phase))
      };
    });
    const tracks = {};

    tracks["ember-hip"] = series((frame, phase) => ({
      tx: Math.cos(phase) * 2.5,
      ty: -Math.abs(Math.sin(phase)) * 10,
      rz: Math.sin(phase * 2) * 1.4,
      ry: Math.sin(phase) * 2.4
    }));
    tracks["ember-pack"] = series((frame, phase) => ({
      ty: Math.sin(phase * 2) * 1.5,
      rz: Math.sin(phase - 0.35) * 2.4
    }));
    tracks["ember-torso"] = series((frame, phase) => ({
      ty: -Math.abs(Math.sin(phase)) * 2.5,
      rz: -3.5 + Math.sin(phase) * 2.2,
      ry: -Math.sin(phase) * 3
    }));
    tracks["ember-cape"] = series((frame, phase) => ({
      tx: Math.cos(phase) * 1.5,
      ty: Math.abs(Math.sin(phase)) * 2,
      rz: 6 + Math.sin(phase - 0.55) * 7,
      ry: Math.cos(phase) * 8,
      scale: 1 + Math.sin(phase - 0.3) * 0.025
    }));
    tracks["ember-head"] = series((frame, phase) => ({
      ty: Math.abs(Math.sin(phase)) * 1.2,
      rz: -Math.sin(phase) * 1.8,
      ry: Math.sin(phase) * 1.5
    }));

    tracks["ember-near-thigh"] = series((frame, phase) => ({
      rz: Math.sin(phase) * 34,
      ry: Math.cos(phase) * 7,
      z: Math.sin(phase) * 7
    }));
    tracks["ember-near-shin"] = series((frame, phase) => ({
      rz: 39 - Math.sin(phase) * 23 + Math.max(0, -Math.cos(phase)) * 7
    }));
    tracks["ember-far-thigh"] = series((frame, phase) => ({
      rz: -Math.sin(phase) * 34,
      ry: -Math.cos(phase) * 7,
      z: -Math.sin(phase) * 7
    }));
    tracks["ember-far-shin"] = series((frame, phase) => ({
      rz: 39 + Math.sin(phase) * 23 + Math.max(0, Math.cos(phase)) * 7
    }));

    tracks["ember-near-upper"] = series((frame, phase) => ({
      rz: -Math.sin(phase) * 30,
      ry: -Math.cos(phase) * 5,
      z: -Math.sin(phase) * 4
    }));
    tracks["ember-near-fore"] = series((frame, phase) => ({
      rz: -7 + Math.cos(phase) * 8
    }));
    tracks["ember-far-upper"] = series((frame, phase) => ({
      rz: Math.sin(phase) * 30,
      ry: Math.cos(phase) * 5,
      z: Math.sin(phase) * 4
    }));
    tracks["ember-far-fore"] = series((frame, phase) => ({
      rz: -7 - Math.cos(phase) * 8
    }));
    tracks["ember-beacon"] = series((frame, phase) => ({
      rz: Math.sin(phase - 0.25) * 3,
      scale: 1 + Math.max(0, Math.sin(phase * 2)) * 0.035
    }));
    return tracks;
  }

  function createTrollerTracks() {
    // The supplied reference has ten distinct drawings at about 70 ms each.
    // We preserve those ten silhouettes one-for-one on the editor's 12 FPS grid:
    // knee-up → drop → wide squat → right kick → return → left-knee loop.
    const frameCount = 10;
    const series = (valuesByFrame) => Array.from({ length: frameCount }, (_, frame) => {
      return {
        time: Math.round((frame * 1000 / 12) * 1000) / 1000,
        values: transform(valuesByFrame(frame))
      };
    });
    const tracks = {};
    const pick = (values, frame) => values[frame];

    tracks["troller-hip"] = series((frame) => ({
      tx: pick([-18, -15, -8, 0, 8, 16, 18, 10, 0, -10], frame),
      ty: pick([-14, -10, 4, 8, -2, -10, -12, -5, 5, -2], frame),
      rz: pick([5, 3, 0, -4, -6, -5, -3, 0, 3, 5], frame),
      ry: pick([-5, -4, 0, 5, 8, 6, 3, 0, -4, -6], frame)
    }));
    tracks["troller-torso"] = series((frame) => ({
      tx: pick([2, 2, 0, -1, -2, -2, -1, 0, 1, 2], frame),
      ty: pick([0, 1, 2, 1, 0, -1, -1, 0, 2, 1], frame),
      rz: pick([-8, -5, 0, 8, 10, 8, 4, 0, -5, -8], frame),
      ry: pick([6, 4, 0, -5, -8, -6, -3, 0, 4, 6], frame),
      scale: pick([1, 1, 0.985, 0.98, 1, 1.02, 1.02, 1, 0.985, 1], frame)
    }));
    tracks["troller-head"] = series((frame) => ({
      tx: pick([-3, -2, 0, 2, 5, 7, 5, 2, 0, -2], frame),
      ty: pick([-4, -3, 0, 2, 0, -3, -4, -2, 1, 0], frame),
      rz: pick([-5, -3, 0, 3, 6, 5, 3, 1, -2, -4], frame),
      ry: pick([4, 2, 0, -3, -5, -4, -2, 0, 3, 4], frame),
      scale: pick([1.02, 1.01, 1, 0.99, 1, 1.02, 1.025, 1.01, 0.99, 1], frame)
    }));

    tracks["troller-far-thigh"] = series((frame) => ({
      rz: pick([78, 68, 40, 32, 8, 5, 10, 36, 42, 70], frame),
      ry: pick([-8, -7, -3, 0, 4, 6, 5, 1, -4, -7], frame),
      z: pick([8, 7, 3, 0, -4, -6, -5, -1, 4, 7], frame)
    }));
    tracks["troller-far-shin"] = series((frame) => ({
      rz: pick([-70, -60, -50, -35, -8, -5, -10, -28, -50, -65], frame)
    }));
    tracks["troller-near-thigh"] = series((frame) => ({
      rz: pick([-8, -12, -40, -72, -78, -72, -65, -36, -42, -10], frame),
      ry: pick([8, 7, 3, 0, -4, -6, -5, -1, 4, 7], frame),
      z: pick([-8, -7, -3, 0, 4, 6, 5, 1, -4, -7], frame)
    }));
    tracks["troller-near-shin"] = series((frame) => ({
      rz: pick([8, 12, 50, 62, 70, 62, 55, 28, 50, 10], frame)
    }));

    tracks["troller-far-upper"] = series((frame) => ({
      rz: pick([70, 75, 55, 45, 80, 100, 105, 85, 55, 65], frame),
      ry: pick([-5, -4, -2, 0, 3, 5, 4, 2, -2, -4], frame),
      z: pick([-5, -4, -2, 0, 3, 5, 4, 2, -2, -4], frame)
    }));
    tracks["troller-far-fore"] = series((frame) => ({
      rz: pick([-85, -80, -55, -70, -95, -105, -90, -55, -45, -70], frame)
    }));
    tracks["troller-near-upper"] = series((frame) => ({
      rz: pick([-45, -50, -55, -45, -100, -105, -90, -80, -55, -50], frame),
      ry: pick([5, 4, 2, 0, -3, -5, -4, -2, 2, 4], frame),
      z: pick([5, 4, 2, 0, -3, -5, -4, -2, 2, 4], frame)
    }));
    tracks["troller-near-fore"] = series((frame) => ({
      rz: pick([75, 70, 55, 70, 105, 100, 85, 55, 45, 65], frame)
    }));
    return tracks;
  }

  function presetBoneFlags(bone, character) {
    const token = `${bone.id} ${bone.name || ""} ${bone.shortName || ""}`.toLowerCase();
    const near = /\bnear\b|\bright\b|torch/.test(token);
    const far = /\bfar\b|\bleft\b|free/.test(token);
    return {
      root: bone.id === character.rootId,
      riderRoot: token.includes("rider-root") || token.includes("rider root"),
      head: /head|helmet|face/.test(token),
      torso: /torso|core/.test(token),
      thigh: token.includes("thigh"),
      shin: /shin|calf/.test(token),
      upperArm: /upper/.test(token) && /arm|astra|ember|troller/.test(token),
      forearm: /forearm|fore\b/.test(token),
      accessory: /tail|cape|pack|backpack|beacon/.test(token),
      side: near ? 1 : (far ? -1 : 0)
    };
  }

  function presetTransform(generatorId, bone, character, frame, frameCount) {
    const flags = presetBoneFlags(bone, character);
    const phase = frame / frameCount * Math.PI * 2;
    const sine = Math.sin(phase);
    const cosine = Math.cos(phase);
    const doubleSine = Math.sin(phase * 2);
    const pulse = Math.abs(doubleSine);
    const side = flags.side || 1;
    const u = frame / Math.max(1, frameCount - 1);

    if (generatorId === "run") {
      if (flags.root) return { tx: cosine * 3, ty: -pulse * 12, rz: doubleSine * 1.8, ry: sine * 2.5 };
      if (flags.riderRoot) return { ty: pulse * 5, rz: -doubleSine * 1.4 };
      if (flags.torso) return { ty: -pulse * 2.5, rz: -4 + sine * 2.5, ry: -sine * 3 };
      if (flags.head) return { ty: pulse * 1.4, rz: -sine * 2, ry: sine * 1.5 };
      if (flags.thigh) return { rz: sine * 35 * side, ry: cosine * 7 * side, z: sine * 7 * side };
      if (flags.shin) return { rz: 38 - sine * 24 * side + Math.max(0, -cosine * side) * 7 };
      if (flags.upperArm) return { rz: -sine * 30 * side, ry: -cosine * 5 * side, z: -sine * 5 * side };
      if (flags.forearm) return { rz: -8 + cosine * 9 * side };
      if (flags.accessory) return { rz: Math.sin(phase - 0.45) * 6, ry: cosine * 5 };
    }

    if (generatorId === "walk") {
      if (flags.root) return { tx: cosine * 1.5, ty: -pulse * 5, rz: doubleSine * 0.8, ry: sine * 1.5 };
      if (flags.torso) return { ty: -pulse, rz: sine * 1.8, ry: -sine * 2 };
      if (flags.head) return { rz: -sine * 1.2, ry: sine };
      if (flags.thigh) return { rz: sine * 22 * side, ry: cosine * 4 * side, z: sine * 4 * side };
      if (flags.shin) return { rz: 24 - sine * 14 * side + Math.max(0, -cosine * side) * 9 };
      if (flags.upperArm) return { rz: -sine * 18 * side, z: -sine * 3 * side };
      if (flags.forearm) return { rz: -5 + cosine * 5 * side };
      if (flags.accessory) return { rz: Math.sin(phase - 0.35) * 3 };
    }

    if (generatorId === "idle") {
      const breath = (1 - Math.cos(phase)) * 0.5;
      if (flags.root) return { ty: -breath * 2, rz: sine * 0.5, ry: sine * 1.2 };
      if (flags.torso) return { ty: -breath * 2, scale: 1 + breath * 0.025, ry: -sine * 1.5 };
      if (flags.head) return { ty: breath, rz: Math.sin(phase - 0.4) * 1.5, ry: sine * 2.5 };
      if (flags.upperArm) return { rz: sine * 1.8 * side };
      if (flags.forearm) return { rz: -sine * 1.2 * side };
      if (flags.accessory) return { rz: Math.sin(phase - 0.65) * 2.5, scale: 1 + breath * 0.012 };
    }

    if (generatorId === "jump") {
      const rootY = [8, 18, 2, -42, -72, -62, -30, 3, 14, 0][frame] ?? 0;
      const crouch = [22, 38, 18, -8, -14, -8, 8, 28, 34, 0][frame] ?? 0;
      if (flags.root) return { ty: rootY, rz: [0, -2, -3, -2, 0, 2, 3, 2, 0, 0][frame], scale: 1 - Math.max(0, crouch) * 0.0012 };
      if (flags.torso) return { ty: Math.max(0, crouch) * 0.12, rz: -crouch * 0.12 };
      if (flags.head) return { ty: -rootY * 0.035, rz: crouch * 0.04 };
      if (flags.thigh) return { rz: crouch * side };
      if (flags.shin) return { rz: Math.max(0, crouch) * 1.25 };
      if (flags.upperArm) return { rz: (-18 - rootY * 0.45) * side };
      if (flags.forearm) return { rz: (12 + rootY * 0.22) * side };
      if (flags.accessory) return { ty: -rootY * 0.12, rz: -rootY * 0.09 };
    }

    if (generatorId === "wave") {
      const wave = Math.sin(phase * 2);
      if (flags.root) return { tx: sine * 2, ty: -pulse * 2, rz: sine * 1.5, ry: sine * 2 };
      if (flags.torso) return { rz: sine * 2.5, ry: -sine * 3 };
      if (flags.head) return { rz: -sine * 3, ry: sine * 5 };
      if (flags.upperArm && side > 0) return { rz: -145 + wave * 10, ry: cosine * 5, z: 9 };
      if (flags.forearm && side > 0) return { rz: 36 + wave * 28, z: 9 };
      if (flags.upperArm) return { rz: sine * 3 * side };
      if (flags.forearm) return { rz: -sine * 2 * side };
      if (flags.accessory) return { rz: Math.sin(phase - 0.5) * 3 };
    }

    if (generatorId === "crouch") {
      const crouch = (1 - Math.cos(phase)) * 0.5;
      if (flags.root) return { ty: crouch * 34, scale: 1 - crouch * 0.035, rz: sine * 1.2 };
      if (flags.torso) return { ty: crouch * 5, rz: -crouch * 8, scale: 1 - crouch * 0.025 };
      if (flags.head) return { ty: -crouch * 3, rz: crouch * 4 };
      if (flags.thigh) return { rz: crouch * 36 * side };
      if (flags.shin) return { rz: crouch * 52 };
      if (flags.upperArm) return { rz: -crouch * 12 * side };
      if (flags.forearm) return { rz: crouch * 18 * side };
      if (flags.accessory) return { ty: crouch * 4, rz: crouch * 5 };
    }

    if (generatorId === "kick") {
      const kick = [0, 0.2, 0.55, 1, 0.88, 0.45, 0.18, 0, 0, 0][frame] ?? 0;
      const load = [0, 0.35, 0.5, 0.2, 0, 0.1, 0.3, 0.2, 0, 0][frame] ?? 0;
      if (flags.root) return { tx: -kick * 8, ty: load * 12 - kick * 5, rz: kick * 5, ry: kick * 8 };
      if (flags.torso) return { rz: -kick * 8, ry: -kick * 7 };
      if (flags.head) return { rz: kick * 4, ry: kick * 3 };
      if (flags.thigh && side > 0) return { rz: -kick * 76 + load * 25, z: kick * 10 };
      if (flags.shin && side > 0) return { rz: (1 - kick) * load * 58 + kick * 8 };
      if (flags.thigh) return { rz: load * 18 * side, z: -kick * 4 };
      if (flags.shin) return { rz: load * 28 };
      if (flags.upperArm) return { rz: kick * 24 * side };
      if (flags.forearm) return { rz: -kick * 18 * side };
      if (flags.accessory) return { rz: -kick * 8 };
    }

    if (generatorId === "celebrate") {
      const hop = Math.abs(Math.sin(phase * 2));
      if (flags.root) return { ty: -hop * 20, rz: sine * 2, ry: sine * 4 };
      if (flags.torso) return { ty: -hop * 2, rz: sine * 4, ry: -sine * 5, scale: 1 + hop * 0.025 };
      if (flags.head) return { ty: hop * 2, rz: -sine * 6, scale: 1 + hop * 0.035 };
      if (flags.thigh) return { rz: sine * 12 * side };
      if (flags.shin) return { rz: 16 + hop * 12 };
      if (flags.upperArm) return { rz: -side * 148 + sine * 12, z: 8 };
      if (flags.forearm) return { rz: side * 24 + doubleSine * 12, z: 8 };
      if (flags.accessory) return { ty: hop * 3, rz: Math.sin(phase - 0.6) * 8 };
    }

    if (generatorId === "look") {
      const scan = Math.sin(phase);
      const settle = Math.sin(phase * 2) * 0.5;
      if (flags.root) return { tx: scan * 2, rz: settle, ry: scan * 4 };
      if (flags.torso) return { rz: -scan * 2.5, ry: scan * 14 };
      if (flags.head) return { tx: scan * 2, rz: -scan * 4, ry: scan * 34 };
      if (flags.upperArm) return { rz: scan * 3 * side, ry: -scan * 3 };
      if (flags.forearm) return { rz: -scan * 2 * side };
      if (flags.accessory) return { rz: -scan * 3, ry: scan * 5 };
    }

    if (generatorId === "trollDance") {
      // A side-to-side troll groove that whips into one full vertical-axis spin.
      // The spin is a shared ry sweep (0 -> 360) that foreshortens every part to
      // a thin sliver at the mid-turn, exactly like the reference GIF, plus a hop
      // and squash-and-stretch as the special-effect flourish. Everything is
      // periodic (or resolves to a full turn) so the clip loops seamlessly.
      const loop = frame / frameCount;                 // 0..1 position in the loop
      const groovePhase = loop * Math.PI * 2;
      const sway = Math.sin(groovePhase);              // 1 lateral sway per loop
      const cos = Math.cos(groovePhase);
      const flail = Math.sin(groovePhase * 2);         // 2 limb flails per loop
      const bob = Math.abs(Math.sin(groovePhase * 2)); // 2 body bobs per loop
      const spinStart = 0.55;
      const spinEnd = 0.88;
      const rawSpin = (loop - spinStart) / (spinEnd - spinStart);
      const spinEase = rawSpin <= 0 ? 0 : rawSpin >= 1 ? 1 : rawSpin * rawSpin * (3 - 2 * rawSpin);
      const spin = spinEase * 360;                     // shared full turn
      const bell = (rawSpin > 0 && rawSpin < 1) ? Math.sin(rawSpin * Math.PI) : 0; // 0..1..0 across spin
      const groove = 1 - bell;                         // dance strength (fades during the spin)
      const whip = Math.sin(spinEase * Math.PI * 2);   // extra rotational snap mid-spin
      const kick = Math.sin(groovePhase * 2 + (side > 0 ? 0 : Math.PI));

      if (flags.root) {
        return {
          tx: sway * 18 * groove,
          ty: -bob * 7 * groove - bell * 32,           // springy hop through the spin
          rz: sway * 4 * groove + whip * 8,
          ry: spin
        };
      }
      if (flags.torso) {
        return {
          tx: -sway * 2 * groove,
          ty: -bell * 4,
          rz: -sway * 10 * groove,
          ry: spin,
          scale: 1 + bob * 0.02 * groove + bell * 0.05
        };
      }
      if (flags.head) {
        return {
          tx: sway * 6 * groove,
          ty: -bob * 5 * groove - bell * 3,
          rz: (sway * 13 + flail * 3) * groove + whip * 6,
          ry: spin,
          scale: 1 + bob * 0.045 * groove + bell * 0.06
        };
      }
      if (flags.thigh) {
        return {
          rz: (kick * 34 + 8) * side * groove + bell * 16 * side,
          ry: spin,
          z: sway * 6 * side * groove
        };
      }
      if (flags.shin) {
        return { rz: (24 - kick * 26) * groove + bell * 26 };
      }
      if (flags.upperArm) {
        return {
          rz: (flail * 55 + 22) * side * groove + bell * (side > 0 ? -128 : 128),
          ry: spin,
          z: sway * 6 * side * groove
        };
      }
      if (flags.forearm) {
        return { rz: (-30 + cos * 46) * side * groove + bell * (side > 0 ? -44 : 44) };
      }
      if (flags.accessory) {
        return { rz: Math.sin(groovePhase - 0.5) * 10 * groove, ry: spin };
      }
    }

    if (generatorId === "dance") {
      if (flags.root) return { tx: sine * 24, ty: -pulse * 9, rz: sine * 5, ry: sine * 8 };
      if (flags.torso) return { tx: -sine * 2, rz: -sine * 11, ry: -sine * 10, scale: 1 + pulse * 0.025 };
      if (flags.head) return { ty: -pulse * 4, rz: sine * 13 + doubleSine * 3, ry: sine * 8, scale: 1 + pulse * 0.04 };
      if (flags.thigh) return { rz: sine * 26 * side, ry: cosine * 8 * side, z: sine * 7 * side };
      if (flags.shin) return { rz: 18 - sine * 24 * side + pulse * 12 };
      if (flags.upperArm) return { rz: doubleSine * 34 * side + sine * 9 * side, ry: cosine * 7 * side, z: sine * 6 * side };
      if (flags.forearm) return { rz: -18 * side + cosine * 30 * side };
      if (flags.accessory) return { rz: Math.sin(phase - 0.55) * 9, ry: cosine * 7 };
    }

    return {};
  }

  function buildPresetTracks(generatorId, character = state.character) {
    if (generatorId === "run" && character.id === "mal") {
      return createMalTracks();
    }
    if (generatorId === "run" && character.id === "astra") {
      return createAstraTracks();
    }
    const preset = BUILTIN_KEYFRAME_SETS.find((item) => item.generatorId === generatorId);
    const frameCounts = {
      run: 12, jump: 10, idle: 12, walk: 12, wave: 12,
      crouch: 10, kick: 10, celebrate: 12, look: 12, dance: 16, trollDance: 24
    };
    const duration = preset?.duration || 1600;
    const frameCount = frameCounts[generatorId] || 12;
    const tracks = {};
    character.bones.forEach((bone) => {
      tracks[bone.id] = Array.from({ length: frameCount }, (_, frame) => ({
        time: Math.round((frame * duration / frameCount) * 1000) / 1000,
        values: transform(presetTransform(generatorId, bone, character, frame, frameCount))
      }));
    });
    return tracks;
  }

  const VALID_SNAP_FPS = [0, 12, 24, 30, 60];

  function normalizeSnapFps(value) {
    return VALID_SNAP_FPS.includes(Number(value)) ? Number(value) : 12;
  }

  function makeClip(raw, fallbackName) {
    const duration = clamp(finiteOr(raw?.duration, 1600), 400, 10000);
    const name = typeof raw?.name === "string" && raw.name.trim()
      ? raw.name.trim().slice(0, 40)
      : fallbackName;
    return {
      id: typeof raw?.id === "string" && raw.id ? raw.id : randomClipId(),
      name,
      duration,
      snapFps: normalizeSnapFps(raw?.snapFps),
      autoOrientPath: Boolean(raw?.autoOrientPath),
      pathAngleOffset: clamp(finiteOr(raw?.pathAngleOffset, 0), -180, 180),
      tracks: sanitizeTracks(raw?.tracks, duration)
    };
  }

  function randomClipId() {
    return `clip-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-2)}`;
  }

  function uniqueClipId() {
    let id = randomClipId();
    while (state.clips.some((clip) => clip.id === id)) {
      id = randomClipId();
    }
    return id;
  }

  function nextActionName() {
    let index = state.clips.length + 1;
    let name = `Action ${index}`;
    while (state.clips.some((clip) => clip.name === name)) {
      index += 1;
      name = `Action ${index}`;
    }
    return name;
  }

  function nextCopyName(base) {
    let name = `${base} copy`;
    let index = 2;
    while (state.clips.some((clip) => clip.name === name)) {
      name = `${base} copy ${index}`;
      index += 1;
    }
    return name.slice(0, 40);
  }

  function normalizeClips(rawClips) {
    const list = Array.isArray(rawClips) ? rawClips : [];
    const clips = [];
    const usedIds = new Set();
    list.forEach((raw, index) => {
      const clip = makeClip(raw, `Action ${index + 1}`);
      while (usedIds.has(clip.id)) {
        clip.id = randomClipId();
      }
      usedIds.add(clip.id);
      clips.push(clip);
    });
    if (!clips.length) {
      const builder = state.character && state.character.buildTracks;
      const defaultDuration = clamp(finiteOr(state.character?.defaultDuration, 1600), 400, 10000);
      const defaultClipId = state.character?.defaultClipId || "run-cycle";
      const defaultClipName = state.character?.defaultClipName || "Run Cycle";
      clips.push(makeClip(
        {
          id: defaultClipId, name: defaultClipName, duration: defaultDuration,
          snapFps: 12, tracks: builder ? builder() : {}
        },
        defaultClipName
      ));
    }
    return clips;
  }

  function getActiveClip() {
    return state.clips.find((clip) => clip.id === state.activeClipId) || state.clips[0];
  }

  function commitLive() {
    const clip = getActiveClip();
    if (!clip) {
      return;
    }
    clip.duration = state.duration;
    clip.snapFps = state.snapFps;
    clip.autoOrientPath = state.autoOrientPath;
    clip.pathAngleOffset = state.pathAngleOffset;
    clip.tracks = state.tracks;
  }

  function loadClipIntoLive(clip) {
    if (!clip) {
      return;
    }
    state.duration = clip.duration;
    state.snapFps = clip.snapFps;
    state.autoOrientPath = clip.autoOrientPath;
    state.pathAngleOffset = clip.pathAngleOffset;
    state.tracks = clip.tracks;
  }

  function serializeClip(clip) {
    return {
      id: clip.id,
      name: clip.name,
      duration: clip.duration,
      snapFps: clip.snapFps,
      autoOrientPath: clip.autoOrientPath,
      pathAngleOffset: clip.pathAngleOffset,
      tracks: clip.tracks
    };
  }

  function applyProjectData(project, resetTime) {
    let rawClips = project?.clips;
    if (!Array.isArray(rawClips) || !rawClips.length) {
      if (project && project.tracks && typeof project.tracks === "object") {
        // Migrate the earlier single-animation format into one clip.
        rawClips = [{
          id: "run-cycle",
          name: "Run Cycle",
          duration: project.duration,
          snapFps: project.snapFps,
          autoOrientPath: project.autoOrientPath,
          pathAngleOffset: project.pathAngleOffset,
          tracks: project.tracks
        }];
      } else {
        // Fresh project: normalizeClips seeds the default Run Cycle animation.
        rawClips = [];
      }
    }
    state.clips = normalizeClips(rawClips);
    const wanted = typeof project?.activeClipId === "string" ? project.activeClipId : null;
    state.activeClipId = state.clips.some((clip) => clip.id === wanted)
      ? wanted
      : state.clips[0].id;
    loadClipIntoLive(getActiveClip());
    state.currentTime = resetTime ? 0 : normalizeTime(state.currentTime);
    state.previewOverrides = {};
    state.projects[state.character.id] = { clips: state.clips, activeClipId: state.activeClipId };
  }

  // ---- Character & scene library engine ------------------------------------
  function randomCharId() {
    let id;
    do {
      id = `char-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-2)}`;
    } while (getCharacterDef(id));
    return id;
  }

  function randomSceneId() {
    return `scene-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-2)}`;
  }

  function allCharacters() {
    return [...BUILTIN_CHARACTERS, ...state.userCharacters];
  }

  function getCharacterDef(id) {
    return allCharacters().find((character) => character.id === id) || null;
  }

  function allScenes() {
    return [...BUILTIN_SCENES, ...state.userScenes];
  }

  function getSceneDef(id) {
    return allScenes().find((scene) => scene.id === id) || BUILTIN_SCENES[0];
  }

  function normalizeHexColor(value, fallback = "#d9d2c5") {
    const color = typeof value === "string" ? value.trim().toLowerCase() : "";
    return /^#[0-9a-f]{6}$/.test(color) ? color : fallback;
  }

  function randomKeyframeSetId() {
    let id;
    do {
      id = `keyset-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-2)}`;
    } while (allKeyframeSets().some((set) => set.id === id));
    return id;
  }

  function allKeyframeSets() {
    return [...BUILTIN_KEYFRAME_SETS, ...state.userKeyframeSets];
  }

  function getKeyframeSet(id) {
    return allKeyframeSets().find((set) => set.id === id) || BUILTIN_KEYFRAME_SETS[0];
  }

  function uniqueKeyframeSetName(base) {
    const clean = (base || "Keyframe Set").trim().slice(0, 40) || "Keyframe Set";
    let name = clean;
    let index = 2;
    while (allKeyframeSets().some((set) => set.name === name)) {
      name = `${clean} ${index}`.slice(0, 40);
      index += 1;
    }
    return name;
  }

  function sanitizeDetachedTracks(input, duration) {
    const output = {};
    Object.entries(input || {}).forEach(([boneId, source]) => {
      if (typeof boneId !== "string" || !Array.isArray(source)) {
        return;
      }
      const unique = new Map();
      source.forEach((key) => {
        const rawTime = finiteOr(key?.time, -1);
        if (rawTime < 0) {
          return;
        }
        const time = Math.round((rawTime % duration) * 1000) / 1000;
        unique.set(time, { time, values: transform(key?.values) });
      });
      output[boneId] = [...unique.values()].sort((left, right) => left.time - right.time);
    });
    return output;
  }

  function sanitizeKeyframeSet(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }
    const duration = clamp(finiteOr(raw.duration, 1600), 400, 10000);
    const hasTracks = raw.tracks && typeof raw.tracks === "object";
    const builtInGenerator = BUILTIN_KEYFRAME_SETS.some((set) => set.generatorId === raw.generatorId);
    if (!hasTracks && !builtInGenerator) {
      return null;
    }
    return {
      id: typeof raw.id === "string" && raw.id ? raw.id : randomKeyframeSetId(),
      name: (typeof raw.name === "string" && raw.name.trim())
        ? raw.name.trim().slice(0, 40)
        : "Keyframe Set",
      description: (typeof raw.description === "string" && raw.description.trim())
        ? raw.description.trim().slice(0, 160)
        : "Imported keyframe set",
      builtin: false,
      generatorId: hasTracks ? null : raw.generatorId,
      duration,
      snapFps: normalizeSnapFps(raw.snapFps),
      sourceCharacterId: typeof raw.sourceCharacterId === "string" ? raw.sourceCharacterId : state.character.id,
      sourceCharacterName: typeof raw.sourceCharacterName === "string" ? raw.sourceCharacterName.slice(0, 40) : state.character.name,
      sourceBoneIds: Array.isArray(raw.sourceBoneIds)
        ? raw.sourceBoneIds.filter((id) => typeof id === "string")
        : Object.keys(raw.tracks || {}),
      tracks: hasTracks ? sanitizeDetachedTracks(raw.tracks, duration) : null
    };
  }

  function materializeKeyframeSet(set, character = state.character) {
    if (set.generatorId) {
      return {
        tracks: buildPresetTracks(set.generatorId, character),
        matchedBones: character.bones.length,
        totalBones: character.bones.length
      };
    }
    const source = set.tracks || {};
    const tracks = sanitizeTracks(source, set.duration);
    const matchedBones = character.bones.reduce(
      (count, bone) => count + (Array.isArray(source[bone.id]) && source[bone.id].length ? 1 : 0),
      0
    );
    return { tracks, matchedBones, totalBones: character.bones.length };
  }

  function renderKeyframeSetLibrary() {
    if (!dom.keyframeSetSelect) {
      return;
    }
    if (!allKeyframeSets().some((set) => set.id === state.activeKeyframeSetId)) {
      state.activeKeyframeSetId = BUILTIN_KEYFRAME_SETS[0].id;
    }
    dom.keyframeSetSelect.textContent = "";
    allKeyframeSets().forEach((set) => {
      const option = document.createElement("option");
      option.value = set.id;
      option.textContent = set.builtin ? set.name : `${set.name} (custom)`;
      option.selected = set.id === state.activeKeyframeSetId;
      dom.keyframeSetSelect.append(option);
    });
    const selected = getKeyframeSet(state.activeKeyframeSetId);
    dom.keyframeSetSelect.title = selected.description || selected.name;
    if (dom.deleteKeyframeSetButton) {
      dom.deleteKeyframeSetButton.disabled = selected.builtin;
    }
  }

  function selectKeyframeSet(id) {
    const set = allKeyframeSets().find((item) => item.id === id);
    if (!set) {
      return;
    }
    state.activeKeyframeSetId = set.id;
    renderKeyframeSetLibrary();
    scheduleAutosave();
    dom.gestureReadout.textContent = `KEYFRAME SET · ${set.name} · ${set.description}`;
  }

  function applySelectedKeyframeSet() {
    const set = getKeyframeSet(state.activeKeyframeSetId);
    const materialized = materializeKeyframeSet(set);
    if (!set.generatorId && materialized.matchedBones === 0) {
      dom.gestureReadout.textContent = `KEYFRAME SET · “${set.name}” has no matching bone IDs for ${state.character.name}`;
      return;
    }
    pause();
    checkpoint();
    commitLive();
    const clip = makeClip({
      id: uniqueClipId(),
      name: set.name,
      duration: set.duration,
      snapFps: set.snapFps,
      tracks: materialized.tracks
    }, set.name);
    insertClip(clip);
    refreshAfterClipChange();
    const compatibility = materialized.matchedBones < materialized.totalBones
      ? ` · ${materialized.matchedBones}/${materialized.totalBones} bones matched`
      : "";
    dom.gestureReadout.textContent = `KEYFRAME SET · Added “${set.name}” as a new clip${compatibility}`;
  }

  function saveActiveClipAsKeyframeSet() {
    commitLive();
    const clip = getActiveClip();
    if (!clip) {
      return;
    }
    const input = window.prompt("Keyframe set name", `${clip.name} Set`);
    if (input === null) {
      return;
    }
    const name = uniqueKeyframeSetName(input);
    const set = {
      id: randomKeyframeSetId(),
      name,
      description: `Saved from ${state.character.name} · ${clip.name}`,
      builtin: false,
      generatorId: null,
      duration: clip.duration,
      snapFps: clip.snapFps,
      sourceCharacterId: state.character.id,
      sourceCharacterName: state.character.name,
      sourceBoneIds: bones.map((bone) => bone.id),
      tracks: JSON.parse(JSON.stringify(clip.tracks))
    };
    state.userKeyframeSets.push(set);
    state.activeKeyframeSetId = set.id;
    renderKeyframeSetLibrary();
    scheduleAutosave();
    dom.gestureReadout.textContent = `KEYFRAME SET · Saved “${set.name}” to the library`;
  }

  function exportKeyframeSet() {
    const set = getKeyframeSet(state.activeKeyframeSetId);
    const materialized = materializeKeyframeSet(set);
    downloadJSON({
      format: "astro-rooster-keyframe-set",
      version: 1,
      generator: "Astro Rooster 2.5D Rig Editor",
      set: {
        id: set.id,
        name: set.name,
        description: set.description,
        duration: set.duration,
        snapFps: set.snapFps,
        sourceCharacterId: state.character.id,
        sourceCharacterName: state.character.name,
        sourceBoneIds: bones.map((bone) => bone.id),
        tracks: materialized.tracks
      }
    }, `${set.name.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "keyframe"}-set.json`);
    dom.gestureReadout.textContent = `KEYFRAME SET · Exported “${set.name}”`;
  }

  function importKeyframeSet(file) {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const raw = data?.format === "astro-rooster-keyframe-set" ? data.set : data;
        const set = sanitizeKeyframeSet(raw);
        if (!set) {
          throw new Error("Invalid keyframe set");
        }
        set.id = randomKeyframeSetId();
        set.name = uniqueKeyframeSetName(set.name || file.name.replace(/\.json$/i, ""));
        state.userKeyframeSets.push(set);
        state.activeKeyframeSetId = set.id;
        renderKeyframeSetLibrary();
        scheduleAutosave();
        dom.gestureReadout.textContent = `KEYFRAME SET · Imported “${set.name}”`;
      } catch (error) {
        dom.gestureReadout.textContent = "KEYFRAME SET · Import failed: invalid keyframe-set JSON";
      }
      dom.keyframeSetInput.value = "";
    };
    reader.readAsText(file);
  }

  function deleteKeyframeSet() {
    const set = getKeyframeSet(state.activeKeyframeSetId);
    if (set.builtin) {
      dom.gestureReadout.textContent = "KEYFRAME SET · Built-in sets can't be deleted";
      return;
    }
    if (!window.confirm(`Delete keyframe set “${set.name}”?`)) {
      return;
    }
    state.userKeyframeSets = state.userKeyframeSets.filter((item) => item.id !== set.id);
    state.activeKeyframeSetId = BUILTIN_KEYFRAME_SETS[0].id;
    renderKeyframeSetLibrary();
    scheduleAutosave();
    dom.gestureReadout.textContent = `KEYFRAME SET · Deleted “${set.name}”`;
  }

  function uniqueCharName(base) {
    const clean = (base || "Character").trim().slice(0, 40) || "Character";
    let name = clean;
    let index = 2;
    const taken = () => allCharacters().some((character) => character.name === name);
    while (taken()) {
      name = `${clean} ${index}`;
      index += 1;
    }
    return name;
  }

  function commitProject() {
    commitLive();
    state.projects[state.character.id] = { clips: state.clips, activeClipId: state.activeClipId };
  }

  function setActiveCharacter(character) {
    state.character = character;
    bones = character.bones;
    indexBones(bones);
    DESIGN_WIDTH = character.designWidth || 1000;
    DESIGN_HEIGHT = character.designHeight || 650;
    state.images = new Map();
    state.imageFailures = 0;
    if (!boneById.has(state.selectedBoneId)) {
      state.selectedBoneId = character.rootId;
    }
  }

  function loadCharacterImages() {
    if (state.character.kind === "asset") {
      loadImages();
    } else {
      state.images = new Map();
      state.imageFailures = 0;
      if (dom.stageLoading) {
        dom.stageLoading.classList.add("hidden");
      }
      if (dom.renderStatus) {
        dom.renderStatus.textContent = "READY";
      }
      state.dirty = true;
    }
  }

  function loadProjectFor(character) {
    const stored = state.projects[character.id];
    const rawClips = stored && Array.isArray(stored.clips) ? stored.clips : [];
    state.clips = normalizeClips(rawClips);
    const wanted = stored && typeof stored.activeClipId === "string" ? stored.activeClipId : null;
    state.activeClipId = state.clips.some((clip) => clip.id === wanted) ? wanted : state.clips[0].id;
    state.projects[character.id] = { clips: state.clips, activeClipId: state.activeClipId };
    if (!boneById.has(state.selectedBoneId)) {
      state.selectedBoneId = character.rootId;
    }
    loadClipIntoLive(getActiveClip());
    state.currentTime = 0;
    state.previewOverrides = {};
  }

  function refreshAfterCharacterChange() {
    syncProjectControls();
    renderLibraryBar();
    renderClipBar();
    renderHierarchy();
    renderTimeline();
    updateTimeUI();
    updateInspector();
    updateCounts();
    state.dirty = true;
  }

  function switchCharacter(characterId) {
    const character = getCharacterDef(characterId);
    if (!character || character.id === state.character.id) {
      return;
    }
    pause();
    commitProject();
    setActiveCharacter(character);
    loadProjectFor(character);
    resizeCanvas();
    loadCharacterImages();
    refreshAfterCharacterChange();
    scheduleAutosave();
    dom.gestureReadout.textContent = `CHARACTER · ${character.name}`;
  }

  function duplicateCharacter() {
    pause();
    commitProject();
    const base = state.character;
    const character = {
      id: randomCharId(),
      name: uniqueCharName(`${base.name} copy`),
      kind: base.kind,
      builtin: false,
      designWidth: base.designWidth,
      designHeight: base.designHeight,
      rootId: base.rootId,
      ground: { ...(base.ground || { y: 566, rx: 80, ry: 14 }) },
      scene: state.sceneId,
      bones: JSON.parse(JSON.stringify(base.bones))
    };
    state.userCharacters.push(character);
    const baseProject = state.projects[base.id];
    state.projects[character.id] = {
      clips: baseProject ? JSON.parse(JSON.stringify(baseProject.clips)) : [],
      activeClipId: baseProject ? baseProject.activeClipId : null
    };
    setActiveCharacter(character);
    loadProjectFor(character);
    resizeCanvas();
    loadCharacterImages();
    refreshAfterCharacterChange();
    scheduleAutosave();
    dom.gestureReadout.textContent = `CHARACTER · Copied “${character.name}”`;
  }

  function renameCharacter() {
    const character = state.character;
    if (character.builtin) {
      dom.gestureReadout.textContent = "CHARACTER · Built-in characters can't be renamed — make a Copy first";
      return;
    }
    const input = window.prompt("Character name", character.name);
    if (input === null) {
      return;
    }
    const name = input.trim().slice(0, 40);
    if (!name || name === character.name) {
      return;
    }
    character.name = uniqueCharName(name);
    renderLibraryBar();
    scheduleAutosave();
    dom.gestureReadout.textContent = `CHARACTER · Renamed to “${character.name}”`;
  }

  function deleteCharacter() {
    const character = state.character;
    if (character.builtin) {
      dom.gestureReadout.textContent = "CHARACTER · Built-in characters can't be deleted";
      return;
    }
    pause();
    state.userCharacters = state.userCharacters.filter((item) => item.id !== character.id);
    delete state.projects[character.id];
    setActiveCharacter(MAL_CHARACTER);
    state.selectedBoneId = MAL_CHARACTER.rootId;
    loadProjectFor(MAL_CHARACTER);
    resizeCanvas();
    loadCharacterImages();
    refreshAfterCharacterChange();
    scheduleAutosave();
    dom.gestureReadout.textContent = `CHARACTER · Deleted “${character.name}”`;
  }

  function applyScene(sceneId) {
    const scene = getSceneDef(sceneId);
    state.sceneId = scene.id;
    const art = dom.sceneArt;
    const shell = dom.stageShell;
    if (!art || !shell) {
      return;
    }
    shell.classList.remove("scene-stars");
    shell.style.backgroundColor = "";
    if (scene.image) {
      art.src = scene.image;
      art.style.display = "";
      art.style.filter = scene.filter || "";
      shell.style.backgroundImage = "";
    } else {
      art.style.display = "none";
      shell.style.backgroundImage = scene.css || "none";
      shell.style.backgroundColor = scene.id === "solid-color"
        ? state.sceneColor
        : (scene.color || "");
      if (scene.stars) {
        shell.classList.add("scene-stars");
      }
    }
    renderLibraryBar();
    state.dirty = true;
  }

  function selectScene(sceneId) {
    if (sceneId === state.sceneId) {
      return;
    }
    applyScene(sceneId);
    scheduleAutosave();
    dom.gestureReadout.textContent = `SCENE · ${getSceneDef(sceneId).name}`;
  }

  function useSolidSceneColor(value) {
    state.sceneColor = normalizeHexColor(value, state.sceneColor);
    if (dom.sceneColorInput) {
      dom.sceneColorInput.value = state.sceneColor;
    }
    if (state.sceneId !== "solid-color") {
      applyScene("solid-color");
    } else if (dom.stageShell) {
      dom.stageShell.classList.remove("scene-stars");
      dom.stageShell.style.backgroundImage = "none";
      dom.stageShell.style.backgroundColor = state.sceneColor;
      dom.sceneArt.style.display = "none";
      state.dirty = true;
    }
    scheduleAutosave();
    dom.gestureReadout.textContent = `SCENE · Solid Color ${state.sceneColor.toUpperCase()}`;
  }

  function addSceneImage(file) {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const scene = {
        id: randomSceneId(),
        name: file.name.replace(/\.[a-z0-9]+$/i, "").slice(0, 40) || "Scene",
        builtin: false,
        image: String(reader.result),
        filter: "saturate(.96) brightness(.82)",
        stars: false,
        css: null
      };
      state.userScenes.push(scene);
      applyScene(scene.id);
      scheduleAutosave();
      dom.gestureReadout.textContent = `SCENE · Added “${scene.name}”`;
      dom.sceneImageInput.value = "";
    };
    reader.readAsDataURL(file);
  }

  function deleteScene() {
    const scene = getSceneDef(state.sceneId);
    if (scene.builtin) {
      dom.gestureReadout.textContent = "SCENE · Built-in scenes can't be deleted";
      return;
    }
    state.userScenes = state.userScenes.filter((item) => item.id !== scene.id);
    applyScene("mal-village");
    scheduleAutosave();
  }

  function sanitizeUserCharacter(raw) {
    if (!raw || typeof raw !== "object" || !Array.isArray(raw.bones) || !raw.bones.length) {
      return null;
    }
    const rootId = typeof raw.rootId === "string"
      ? raw.rootId
      : (raw.bones.find((bone) => !bone.parent)?.id || raw.bones[0].id);
    return {
      id: typeof raw.id === "string" && raw.id ? raw.id : randomCharId(),
      name: (typeof raw.name === "string" && raw.name.trim()) ? raw.name.trim().slice(0, 40) : "Character",
      kind: raw.kind === "asset" ? "asset" : "vector",
      builtin: false,
      designWidth: clamp(finiteOr(raw.designWidth, 1000), 200, 4000),
      designHeight: clamp(finiteOr(raw.designHeight, 650), 200, 4000),
      rootId,
      ground: raw.ground && typeof raw.ground === "object"
        ? { y: finiteOr(raw.ground.y, 566), rx: finiteOr(raw.ground.rx, 80), ry: finiteOr(raw.ground.ry, 14) }
        : { y: 566, rx: 80, ry: 14 },
      scene: typeof raw.scene === "string" ? raw.scene : null,
      bones: raw.bones
    };
  }

  function sanitizeUserScene(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }
    return {
      id: typeof raw.id === "string" && raw.id ? raw.id : randomSceneId(),
      name: (typeof raw.name === "string" && raw.name.trim()) ? raw.name.trim().slice(0, 40) : "Scene",
      builtin: false,
      image: typeof raw.image === "string" ? raw.image : null,
      css: typeof raw.css === "string" ? raw.css : null,
      color: /^#[0-9a-f]{6}$/i.test(raw.color || "") ? raw.color.toLowerCase() : null,
      filter: typeof raw.filter === "string" ? raw.filter : "",
      stars: Boolean(raw.stars)
    };
  }

  function downloadJSON(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function fullSnapshot() {
    commitProject();
    return JSON.stringify({
      version: 4,
      activeCharacterId: state.character.id,
      sceneId: state.sceneId,
      sceneColor: state.sceneColor,
      activeKeyframeSetId: state.activeKeyframeSetId,
      userCharacters: state.userCharacters,
      userScenes: state.userScenes,
      userKeyframeSets: state.userKeyframeSets,
      aiAssist: state.aiAssist,
      projects: state.projects
    });
  }

  function applyFullModel(model, resetTime) {
    state.userCharacters = Array.isArray(model?.userCharacters)
      ? model.userCharacters.map(sanitizeUserCharacter).filter(Boolean)
      : [];
    state.userScenes = Array.isArray(model?.userScenes)
      ? model.userScenes.map(sanitizeUserScene).filter(Boolean)
      : [];
    state.userKeyframeSets = Array.isArray(model?.userKeyframeSets)
      ? model.userKeyframeSets.map(sanitizeKeyframeSet).filter(Boolean)
      : [];
    state.sceneColor = normalizeHexColor(model?.sceneColor, "#d9d2c5");
    state.aiAssist = model?.aiAssist === true;
    updateAiAssistUI();
    state.activeKeyframeSetId = allKeyframeSets().some((set) => set.id === model?.activeKeyframeSetId)
      ? model.activeKeyframeSetId
      : BUILTIN_KEYFRAME_SETS[0].id;

    if (model && model.projects && typeof model.projects === "object") {
      state.projects = {};
      Object.keys(model.projects).forEach((id) => {
        const project = model.projects[id];
        if (project && Array.isArray(project.clips)) {
          state.projects[id] = { clips: project.clips, activeClipId: project.activeClipId };
        }
      });
    } else if (model && (Array.isArray(model.clips) || model.tracks)) {
      // Legacy v2 single-animation autosave → becomes the MAL project.
      const clips = Array.isArray(model.clips) && model.clips.length
        ? model.clips
        : [{
            id: "run-cycle", name: "Run Cycle", duration: model.duration, snapFps: model.snapFps,
            autoOrientPath: model.autoOrientPath, pathAngleOffset: model.pathAngleOffset, tracks: model.tracks
          }];
      state.projects = { mal: { clips, activeClipId: model.activeClipId || (clips[0] && clips[0].id) } };
    } else {
      state.projects = {};
    }

    const wantCharacter = getCharacterDef(model?.activeCharacterId) || MAL_CHARACTER;
    state.selectedBoneId = wantCharacter.rootId;
    setActiveCharacter(wantCharacter);
    loadProjectFor(wantCharacter);
    if (resetTime) {
      state.currentTime = 0;
    }
    state.sceneId = (model && typeof model.sceneId === "string" && allScenes().some((scene) => scene.id === model.sceneId))
      ? model.sceneId
      : (wantCharacter.scene || "mal-village");
  }

  function exportCharacter() {
    commitProject();
    const character = state.character;
    const project = state.projects[character.id] || { clips: state.clips, activeClipId: state.activeClipId };
    downloadJSON({
      format: "astro-rooster-character",
      version: 1,
      generator: "Astro Rooster 2.5D Rig Editor",
      character: {
        id: character.id,
        name: character.name,
        kind: character.kind,
        designWidth: character.designWidth,
        designHeight: character.designHeight,
        rootId: character.rootId,
        ground: character.ground,
        scene: character.scene,
        bones: character.bones.map((bone) => ({ ...bone }))
      },
      activeClipId: project.activeClipId,
      clips: (project.clips || []).map(serializeClip)
    }, `${character.name.replace(/\s+/g, "-").toLowerCase()}-character.json`);
    dom.saveState.textContent = `Exported ${character.name}`;
  }

  function importCharacter(file) {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        let rawCharacter;
        let clips;
        let activeClipId;
        if (data.format === "astro-rooster-character" && data.character) {
          rawCharacter = data.character;
          clips = data.clips;
          activeClipId = data.activeClipId;
        } else if (Array.isArray(data.bones) && data.bones.length) {
          rawCharacter = {
            name: file.name.replace(/\.json$/i, ""),
            bones: data.bones,
            designWidth: data.designSize?.width,
            designHeight: data.designSize?.height
          };
          clips = data.clips;
          activeClipId = data.activeClipId;
          if ((!Array.isArray(clips) || !clips.length) && data.tracks) {
            clips = [{ id: "run-cycle", name: "Run Cycle", duration: data.duration, snapFps: data.snapFps, tracks: data.tracks }];
          }
        } else {
          throw new Error("No character bones in file");
        }
        const character = sanitizeUserCharacter(rawCharacter);
        if (!character) {
          throw new Error("Invalid character");
        }
        while (getCharacterDef(character.id)) {
          character.id = randomCharId();
        }
        character.name = uniqueCharName(character.name);
        commitProject();
        state.userCharacters.push(character);
        state.projects[character.id] = {
          clips: Array.isArray(clips) ? clips : [],
          activeClipId
        };
        setActiveCharacter(character);
        loadProjectFor(character);
        resizeCanvas();
        loadCharacterImages();
        if (character.scene && allScenes().some((scene) => scene.id === character.scene)) {
          applyScene(character.scene);
        }
        refreshAfterCharacterChange();
        scheduleAutosave();
        dom.saveState.textContent = `Imported ${character.name}`;
      } catch (error) {
        dom.saveState.textContent = "Import failed: invalid character JSON";
      }
      dom.importInput.value = "";
    };
    reader.readAsText(file);
  }

  function renderLibraryBar() {
    if (!dom.characterSelect) {
      return;
    }
    dom.characterSelect.textContent = "";
    allCharacters().forEach((character) => {
      const option = document.createElement("option");
      option.value = character.id;
      option.textContent = character.builtin ? character.name : `${character.name} (custom)`;
      if (character.id === state.character.id) {
        option.selected = true;
      }
      dom.characterSelect.append(option);
    });
    dom.sceneSelect.textContent = "";
    allScenes().forEach((scene) => {
      const option = document.createElement("option");
      option.value = scene.id;
      option.textContent = scene.builtin ? scene.name : `${scene.name} (custom)`;
      if (scene.id === state.sceneId) {
        option.selected = true;
      }
      dom.sceneSelect.append(option);
    });
    const custom = !state.character.builtin;
    if (dom.renameCharacterButton) {
      dom.renameCharacterButton.disabled = !custom;
    }
    if (dom.deleteCharacterButton) {
      dom.deleteCharacterButton.disabled = !custom;
    }
    if (dom.deleteSceneButton) {
      dom.deleteSceneButton.disabled = getSceneDef(state.sceneId).builtin;
    }
    if (dom.sceneColorInput) {
      dom.sceneColorInput.value = state.sceneColor;
    }
    renderKeyframeSetLibrary();
  }

  function normalizeTime(time) {
    if (state.duration <= 0) {
      return 0;
    }
    const normalized = time % state.duration;
    return normalized < 0 ? normalized + state.duration : normalized;
  }

  function snapTime(time) {
    const normalized = normalizeTime(time);
    if (!state.snapFps) {
      return Math.round(normalized);
    }
    const step = 1000 / state.snapFps;
    const snapped = Math.round(normalized / step) * step;
    return snapped >= state.duration ? 0 : Math.round(snapped * 1000) / 1000;
  }

  function sampleTrack(track, time) {
    if (!track || !track.length) {
      return { ...DEFAULT_TRANSFORM };
    }
    if (track.length === 1) {
      return transform(track[0].values);
    }

    const localTime = normalizeTime(time);
    const sorted = track;
    for (let index = 0; index < sorted.length; index += 1) {
      if (Math.abs(sorted[index].time - localTime) < 0.001) {
        return transform(sorted[index].values);
      }
    }

    let previous = sorted[sorted.length - 1];
    let next = sorted[0];
    let previousTime = previous.time - state.duration;
    let nextTime = next.time;

    for (let index = 0; index < sorted.length - 1; index += 1) {
      if (localTime > sorted[index].time && localTime < sorted[index + 1].time) {
        previous = sorted[index];
        next = sorted[index + 1];
        previousTime = previous.time;
        nextTime = next.time;
        break;
      }
    }

    if (localTime > sorted[sorted.length - 1].time) {
      previous = sorted[sorted.length - 1];
      next = sorted[0];
      previousTime = previous.time;
      nextTime = next.time + state.duration;
    } else if (localTime < sorted[0].time) {
      previous = sorted[sorted.length - 1];
      next = sorted[0];
      previousTime = previous.time - state.duration;
      nextTime = next.time;
    }

    const span = Math.max(0.001, nextTime - previousTime);
    const amount = (localTime - previousTime) / span;
    return lerpTransform(
      transform(previous.values),
      transform(next.values),
      amount
    );
  }

  function poseForBone(boneId, time, includePreview = true) {
    if (includePreview && state.previewOverrides[boneId]) {
      return transform(state.previewOverrides[boneId]);
    }
    return sampleTrack(state.tracks[boneId], time);
  }

  function matrixMultiply(left, right) {
    return {
      a: left.a * right.a + left.c * right.b,
      b: left.b * right.a + left.d * right.b,
      c: left.a * right.c + left.c * right.d,
      d: left.b * right.c + left.d * right.d,
      e: left.a * right.e + left.c * right.f + left.e,
      f: left.b * right.e + left.d * right.f + left.f
    };
  }

  function matrixInvert(matrix) {
    const determinant = matrix.a * matrix.d - matrix.b * matrix.c;
    if (Math.abs(determinant) < 0.000001) {
      return null;
    }
    return {
      a: matrix.d / determinant,
      b: -matrix.b / determinant,
      c: -matrix.c / determinant,
      d: matrix.a / determinant,
      e: (matrix.c * matrix.f - matrix.d * matrix.e) / determinant,
      f: (matrix.b * matrix.e - matrix.a * matrix.f) / determinant
    };
  }

  function pointThrough(matrix, x, y) {
    return {
      x: matrix.a * x + matrix.c * y + matrix.e,
      y: matrix.b * x + matrix.d * y + matrix.f
    };
  }

  function localMatrix(bone, pose) {
    const radians = degToRad(bone.baseRz + pose.rz);
    const perspectiveScale = clamp(1 + (bone.baseZ + pose.z) / 1200, 0.72, 1.3);
    const scaleY = pose.scale * perspectiveScale;
    const scaleX = scaleY * Math.max(0.34, Math.cos(degToRad(pose.ry)));
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);
    return {
      a: cosine * scaleX,
      b: sine * scaleX,
      c: -sine * scaleY,
      d: cosine * scaleY,
      e: bone.x + pose.tx,
      f: bone.y + pose.ty
    };
  }

  function buildMatrices(time, includePreview = true) {
    const result = new Map();
    bones.forEach((bone) => {
      const pose = poseForBone(bone.id, time, includePreview);
      const local = localMatrix(bone, pose);
      const parentMatrix = bone.parent ? result.get(bone.parent) : null;
      result.set(bone.id, parentMatrix ? matrixMultiply(parentMatrix, local) : local);
    });
    return result;
  }

  function viewMatrix() {
    return {
      a: state.view.scale,
      b: 0,
      c: 0,
      d: state.view.scale,
      e: state.view.offsetX,
      f: state.view.offsetY
    };
  }

  function setCanvasMatrix(matrix) {
    const dpr = state.view.dpr;
    ctx.setTransform(
      matrix.a * dpr,
      matrix.b * dpr,
      matrix.c * dpr,
      matrix.d * dpr,
      matrix.e * dpr,
      matrix.f * dpr
    );
  }

  function fitCenter() {
    return {
      x: state.view.fitOffsetX + DESIGN_WIDTH * state.view.fitScale / 2,
      y: state.view.fitOffsetY + DESIGN_HEIGHT * state.view.fitScale / 2
    };
  }

  function applyCameraToView() {
    const zoom = clamp(state.camera.zoom, 0.6, 4);
    state.camera.zoom = zoom;
    state.view.scale = state.view.fitScale * zoom;
    state.view.offsetX =
      state.view.fitOffsetX +
      state.camera.panX +
      DESIGN_WIDTH * state.view.fitScale * (1 - zoom) / 2;
    state.view.offsetY =
      state.view.fitOffsetY +
      state.camera.panY +
      DESIGN_HEIGHT * state.view.fitScale * (1 - zoom) / 2;
    dom.cameraZoomLevel.textContent = `${Math.round(zoom * 100)}%`;
    state.dirty = true;
  }

  function setCameraZoom(nextZoom, anchor = null) {
    const oldZoom = state.camera.zoom;
    const zoom = clamp(nextZoom, 0.6, 4);
    const center = fitCenter();
    const focus = anchor || {
      x: state.view.width / 2,
      y: state.view.height / 2
    };
    const baseVectorX = (focus.x - center.x - state.camera.panX) / oldZoom;
    const baseVectorY = (focus.y - center.y - state.camera.panY) / oldZoom;
    state.camera.zoom = zoom;
    state.camera.panX = clamp(focus.x - center.x - zoom * baseVectorX, -1600, 1600);
    state.camera.panY = clamp(focus.y - center.y - zoom * baseVectorY, -1200, 1200);
    applyCameraToView();
  }

  function resetCamera() {
    state.camera.zoom = 1;
    state.camera.panX = 0;
    state.camera.panY = 0;
    applyCameraToView();
    saveCameraPreference();
    dom.gestureReadout.textContent = "CAMERA · Fit to stage · 100%";
  }

  function saveCameraPreference() {
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, JSON.stringify(state.camera));
    } catch (error) {
      // Camera preferences are optional and never block editing.
    }
  }

  function scheduleCameraPreferenceSave() {
    window.clearTimeout(state.cameraSaveTimer);
    state.cameraSaveTimer = window.setTimeout(saveCameraPreference, 180);
  }

  function loadCameraPreference() {
    try {
      const saved = JSON.parse(localStorage.getItem(VIEW_STORAGE_KEY) || "null");
      if (!saved) {
        return;
      }
      state.camera.zoom = clamp(finiteOr(saved.zoom, 1), 0.6, 4);
      state.camera.panX = clamp(finiteOr(saved.panX, 0), -1600, 1600);
      state.camera.panY = clamp(finiteOr(saved.panY, 0), -1200, 1200);
    } catch (error) {
      state.camera = { zoom: 1, panX: 0, panY: 0 };
    }
  }

  function resizeCanvas() {
    const rectangle = dom.stageShell.getBoundingClientRect();
    const width = Math.max(1, Math.round(rectangle.width));
    const height = Math.max(1, Math.round(rectangle.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    if (
      state.view.width === width &&
      state.view.height === height &&
      state.view.dpr === dpr
    ) {
      return;
    }
    state.view.width = width;
    state.view.height = height;
    state.view.dpr = dpr;
    state.view.fitScale = Math.min(width / DESIGN_WIDTH, height / DESIGN_HEIGHT);
    state.view.fitOffsetX = (width - DESIGN_WIDTH * state.view.fitScale) / 2;
    state.view.fitOffsetY = (height - DESIGN_HEIGHT * state.view.fitScale) / 2;
    applyCameraToView();
    dom.canvas.width = Math.max(1, Math.round(width * dpr));
    dom.canvas.height = Math.max(1, Math.round(height * dpr));
    state.dirty = true;
  }

  function drawGroundShadow(matrices, alpha = 1) {
    const ground = state.character.ground || { y: 566, rx: 122, ry: 20 };
    const root = matrices.get(state.character.rootId);
    if (!root) {
      return;
    }
    const rootPoint = pointThrough(root, 0, 0);
    const matrix = matrixMultiply(viewMatrix(), {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      e: rootPoint.x,
      f: ground.y
    });
    setCanvasMatrix(matrix);
    ctx.save();
    ctx.globalAlpha = 0.35 * alpha;
    ctx.fillStyle = "#090504";
    ctx.beginPath();
    ctx.ellipse(0, 0, ground.rx, ground.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function roundRectPath(x, y, w, h, r) {
    const radius = Math.max(0, Math.min(r, Math.min(Math.abs(w), Math.abs(h)) / 2));
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, radius);
    } else {
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
      ctx.closePath();
    }
  }

  function drawBoneShape(bone, alpha) {
    const shape = bone.shape;
    if (!shape) {
      return;
    }
    const w = bone.width;
    const h = bone.height;
    const x0 = -w * bone.pivotX;
    const y0 = -h * bone.pivotY;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.fillStyle = shape.fill || "#cccccc";
    ctx.strokeStyle = shape.stroke || "rgba(0,0,0,.4)";
    ctx.lineWidth = shape.lineWidth || 3;
    const kind = shape.kind;

    if (kind === "troll-face") {
      // Irregular cheek-and-chin silhouette inspired by the classic rage-comic
      // troll grin, redrawn as a compact procedural vector for this rig.
      ctx.beginPath();
      ctx.moveTo(x0 + w * 0.14, y0 + h * 0.22);
      ctx.bezierCurveTo(
        x0 + w * 0.2, y0 + h * 0.06,
        x0 + w * 0.7, y0 + h * 0.02,
        x0 + w * 0.86, y0 + h * 0.19
      );
      ctx.quadraticCurveTo(x0 + w * 0.99, y0 + h * 0.37, x0 + w * 0.88, y0 + h * 0.57);
      ctx.quadraticCurveTo(x0 + w * 0.8, y0 + h * 0.82, x0 + w * 0.56, y0 + h * 0.93);
      ctx.quadraticCurveTo(x0 + w * 0.24, y0 + h * 0.96, x0 + w * 0.12, y0 + h * 0.71);
      ctx.quadraticCurveTo(x0 + w * 0.03, y0 + h * 0.5, x0 + w * 0.14, y0 + h * 0.22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // The reference has compact looped ears and stacked forehead wrinkles.
      ctx.beginPath();
      ctx.ellipse(x0 + w * 0.1, y0 + h * 0.39, w * 0.055, h * 0.105, -0.1, 0, Math.PI * 2);
      ctx.ellipse(x0 + w * 0.9, y0 + h * 0.37, w * 0.055, h * 0.105, 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = shape.stroke || "#171515";
      ctx.lineWidth = Math.max(1.6, (shape.lineWidth || 4) * 0.42);
      ctx.beginPath();
      ctx.moveTo(x0 + w * 0.22, y0 + h * 0.14);
      ctx.quadraticCurveTo(x0 + w * 0.48, y0 + h * 0.08, x0 + w * 0.76, y0 + h * 0.13);
      ctx.moveTo(x0 + w * 0.26, y0 + h * 0.19);
      ctx.quadraticCurveTo(x0 + w * 0.48, y0 + h * 0.14, x0 + w * 0.72, y0 + h * 0.18);
      ctx.moveTo(x0 + w * 0.1, y0 + h * 0.35);
      ctx.quadraticCurveTo(x0 + w * 0.06, y0 + h * 0.4, x0 + w * 0.11, y0 + h * 0.46);
      ctx.moveTo(x0 + w * 0.9, y0 + h * 0.33);
      ctx.quadraticCurveTo(x0 + w * 0.95, y0 + h * 0.38, x0 + w * 0.9, y0 + h * 0.44);
      ctx.stroke();

      // Left eye squeezes shut; the right eye is a dark almond with a glint.
      ctx.lineWidth = Math.max(2.5, (shape.lineWidth || 4) * 0.82);
      ctx.beginPath();
      ctx.moveTo(x0 + w * 0.18, y0 + h * 0.29);
      ctx.quadraticCurveTo(x0 + w * 0.3, y0 + h * 0.2, x0 + w * 0.42, y0 + h * 0.29);
      ctx.quadraticCurveTo(x0 + w * 0.3, y0 + h * 0.36, x0 + w * 0.2, y0 + h * 0.32);
      ctx.stroke();
      ctx.fillStyle = shape.stroke || "#171515";
      ctx.beginPath();
      ctx.ellipse(x0 + w * 0.67, y0 + h * 0.29, w * 0.125, h * 0.075, -0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fffdf3";
      ctx.beginPath();
      ctx.ellipse(x0 + w * 0.63, y0 + h * 0.27, w * 0.028, h * 0.021, 0, 0, Math.PI * 2);
      ctx.fill();

      // Crooked nose and cheek creases.
      ctx.lineWidth = Math.max(2, (shape.lineWidth || 4) * 0.58);
      ctx.beginPath();
      ctx.moveTo(x0 + w * 0.48, y0 + h * 0.28);
      ctx.lineTo(x0 + w * 0.41, y0 + h * 0.4);
      ctx.quadraticCurveTo(x0 + w * 0.47, y0 + h * 0.47, x0 + w * 0.56, y0 + h * 0.43);
      ctx.lineTo(x0 + w * 0.61, y0 + h * 0.39);
      ctx.moveTo(x0 + w * 0.15, y0 + h * 0.43);
      ctx.quadraticCurveTo(x0 + w * 0.24, y0 + h * 0.48, x0 + w * 0.29, y0 + h * 0.54);
      ctx.moveTo(x0 + w * 0.13, y0 + h * 0.5);
      ctx.quadraticCurveTo(x0 + w * 0.22, y0 + h * 0.54, x0 + w * 0.25, y0 + h * 0.59);
      ctx.moveTo(x0 + w * 0.86, y0 + h * 0.4);
      ctx.quadraticCurveTo(x0 + w * 0.78, y0 + h * 0.47, x0 + w * 0.75, y0 + h * 0.54);
      ctx.moveTo(x0 + w * 0.87, y0 + h * 0.49);
      ctx.quadraticCurveTo(x0 + w * 0.8, y0 + h * 0.54, x0 + w * 0.78, y0 + h * 0.59);
      ctx.stroke();

      // Oversized black grin, cream teeth, and individual tooth separators.
      ctx.fillStyle = shape.stroke || "#171515";
      ctx.lineWidth = Math.max(3, shape.lineWidth || 4);
      ctx.beginPath();
      ctx.moveTo(x0 + w * 0.16, y0 + h * 0.52);
      ctx.bezierCurveTo(
        x0 + w * 0.35, y0 + h * 0.65,
        x0 + w * 0.69, y0 + h * 0.62,
        x0 + w * 0.88, y0 + h * 0.47
      );
      ctx.bezierCurveTo(
        x0 + w * 0.82, y0 + h * 0.83,
        x0 + w * 0.31, y0 + h * 0.91,
        x0 + w * 0.16, y0 + h * 0.52
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fffdf3";
      ctx.beginPath();
      ctx.moveTo(x0 + w * 0.24, y0 + h * 0.59);
      ctx.quadraticCurveTo(x0 + w * 0.55, y0 + h * 0.72, x0 + w * 0.8, y0 + h * 0.56);
      ctx.quadraticCurveTo(x0 + w * 0.68, y0 + h * 0.78, x0 + w * 0.34, y0 + h * 0.78);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.lineWidth = Math.max(1.4, (shape.lineWidth || 4) * 0.38);
      ctx.beginPath();
      [0.31, 0.39, 0.47, 0.55, 0.63, 0.71].forEach((ratio) => {
        ctx.moveTo(x0 + w * ratio, y0 + h * 0.64);
        ctx.lineTo(x0 + w * (ratio - 0.01), y0 + h * 0.78);
      });
      ctx.moveTo(x0 + w * 0.29, y0 + h * 0.7);
      ctx.quadraticCurveTo(x0 + w * 0.54, y0 + h * 0.74, x0 + w * 0.75, y0 + h * 0.67);
      ctx.moveTo(x0 + w * 0.25, y0 + h * 0.83);
      ctx.quadraticCurveTo(x0 + w * 0.48, y0 + h * 0.9, x0 + w * 0.7, y0 + h * 0.82);
      ctx.moveTo(x0 + w * 0.28, y0 + h * 0.88);
      ctx.quadraticCurveTo(x0 + w * 0.48, y0 + h * 0.94, x0 + w * 0.65, y0 + h * 0.87);
      ctx.stroke();
    } else if (kind === "stick-torso") {
      ctx.strokeStyle = shape.stroke || "#171515";
      ctx.fillStyle = shape.fill || "#171515";
      ctx.lineWidth = shape.lineWidth || 7;
      ctx.beginPath();
      ctx.moveTo(x0 + w * 0.5, y0 + h * 0.06);
      ctx.lineTo(x0 + w * 0.5, y0 + h * 0.94);
      ctx.moveTo(x0 + w * 0.12, y0 + h * 0.2);
      ctx.lineTo(x0 + w * 0.88, y0 + h * 0.2);
      ctx.moveTo(x0 + w * 0.27, y0 + h * 0.91);
      ctx.lineTo(x0 + w * 0.73, y0 + h * 0.91);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x0 + w * 0.5, y0 + h * 0.06, ctx.lineWidth * 0.62, 0, Math.PI * 2);
      ctx.arc(x0 + w * 0.5, y0 + h * 0.94, ctx.lineWidth * 0.62, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === "stick-limb") {
      ctx.strokeStyle = shape.stroke || "#171515";
      ctx.fillStyle = shape.fill || "#171515";
      ctx.lineWidth = shape.lineWidth || 7;
      const centerX = x0 + w * 0.5;
      const startY = y0 + h * 0.08;
      const endY = y0 + h * 0.92;
      ctx.beginPath();
      ctx.moveTo(centerX, startY);
      ctx.lineTo(centerX, endY);
      if (shape.foot) {
        ctx.quadraticCurveTo(centerX + w * 0.2, y0 + h, centerX + w * 1.25, y0 + h);
      }
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX, startY, ctx.lineWidth * 0.55, 0, Math.PI * 2);
      ctx.arc(centerX, endY, ctx.lineWidth * (shape.hand ? 0.78 : 0.55), 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === "stick-joint") {
      ctx.fillStyle = shape.fill || "#171515";
      ctx.beginPath();
      ctx.arc(x0 + w * 0.5, y0 + h * 0.5, Math.min(w, h) * 0.45, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === "ellipse" || kind === "helmet" || kind === "rescue-helmet") {
      ctx.beginPath();
      ctx.ellipse(x0 + w / 2, y0 + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (kind === "helmet" || kind === "rescue-helmet") {
        ctx.fillStyle = shape.visor || "#79d7e9";
        roundRectPath(x0 + w * 0.4, y0 + h * 0.26, w * 0.52, h * 0.42, Math.min(w, h) * 0.24);
        ctx.fill();
        ctx.save();
        ctx.globalAlpha = alpha * 0.5;
        ctx.fillStyle = "rgba(255,255,255,.55)";
        ctx.beginPath();
        ctx.ellipse(x0 + w * 0.58, y0 + h * 0.4, w * 0.09, h * 0.11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        if (kind === "rescue-helmet") {
          ctx.fillStyle = shape.accent || "#ef6a32";
          roundRectPath(x0 + w * 0.62, y0 + h * 0.62, w * 0.3, h * 0.12, h * 0.05);
          ctx.fill();
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(x0 + w * 0.2, y0 + h * 0.47, w * 0.08, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
    } else if (kind === "torso" || kind === "rescue-torso") {
      roundRectPath(x0, y0, w, h, Math.min(w, h) * 0.42);
      ctx.fill();
      ctx.stroke();
      // chest light + belt accents
      ctx.fillStyle = shape.accent || "#79d7e9";
      roundRectPath(x0 + w * 0.3, y0 + h * 0.16, w * 0.4, h * 0.16, Math.min(w, h) * 0.14);
      ctx.fill();
      ctx.fillStyle = shape.belt || "#ffad55";
      roundRectPath(x0, y0 + h * 0.78, w, h * 0.13, 3);
      ctx.fill();
      ctx.stroke();
      if (kind === "rescue-torso") {
        ctx.fillStyle = shape.accent || "#47c8bd";
        ctx.beginPath();
        ctx.moveTo(x0 + w * 0.18, y0 + h * 0.55);
        ctx.lineTo(x0 + w * 0.43, y0 + h * 0.68);
        ctx.lineTo(x0 + w * 0.82, y0 + h * 0.48);
        ctx.lineTo(x0 + w * 0.82, y0 + h * 0.6);
        ctx.lineTo(x0 + w * 0.43, y0 + h * 0.79);
        ctx.lineTo(x0 + w * 0.18, y0 + h * 0.66);
        ctx.closePath();
        ctx.fill();
      }
    } else if (kind === "cape") {
      ctx.beginPath();
      ctx.moveTo(x0 + w * 0.18, y0);
      ctx.quadraticCurveTo(x0 + w * 0.58, y0 + h * 0.08, x0 + w * 0.78, y0 + h * 0.38);
      ctx.lineTo(x0 + w, y0 + h * 0.92);
      ctx.quadraticCurveTo(x0 + w * 0.72, y0 + h, x0 + w * 0.53, y0 + h * 0.86);
      ctx.quadraticCurveTo(x0 + w * 0.31, y0 + h * 0.98, x0 + w * 0.08, y0 + h * 0.82);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = shape.accent || "#ffb15b";
      ctx.lineWidth = Math.max(2, (shape.lineWidth || 3) * 0.72);
      ctx.beginPath();
      ctx.moveTo(x0 + w * 0.27, y0 + h * 0.18);
      ctx.quadraticCurveTo(x0 + w * 0.53, y0 + h * 0.38, x0 + w * 0.72, y0 + h * 0.77);
      ctx.stroke();
    } else if (kind === "capsule") {
      roundRectPath(x0, y0, w, h, Math.min(w, h) / 2);
      ctx.fill();
      ctx.stroke();
    } else if (kind === "shin") {
      roundRectPath(x0, y0, w, h * 0.84, Math.min(w, h) / 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = shape.boot || "#3a2f27";
      roundRectPath(x0 - w * 0.15, y0 + h * 0.78, w * 1.55, h * 0.22, h * 0.09);
      ctx.fill();
      ctx.stroke();
    } else if (kind === "hand") {
      roundRectPath(x0, y0, w, h * 0.82, Math.min(w, h) / 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = shape.glove || shape.fill || "#cccccc";
      ctx.beginPath();
      ctx.ellipse(x0 + w / 2, y0 + h * 0.86, w * 0.62, h * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (kind === "beacon") {
      roundRectPath(x0, y0, w, h, Math.min(w, h) * 0.32);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = shape.accent || "#47c8bd";
      ctx.beginPath();
      ctx.arc(x0 + w * 0.5, y0 + h * 0.47, Math.min(w, h) * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = shape.glow || "#c9fff2";
      ctx.beginPath();
      ctx.arc(x0 + w * 0.44, y0 + h * 0.39, Math.min(w, h) * 0.065, 0, Math.PI * 2);
      ctx.fill();
    } else {
      roundRectPath(x0, y0, w, h, shape.radius || 6);
      ctx.fill();
      ctx.stroke();
      if (shape.accent) {
        ctx.fillStyle = shape.accent;
        roundRectPath(x0 + w * 0.22, y0 + h * 0.12, w * 0.56, h * 0.12, 3);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawArt(matrices, time, alpha = 1, includePreview = true) {
    const ordered = bones.slice().sort((left, right) => {
      const leftPose = poseForBone(left.id, time, includePreview);
      const rightPose = poseForBone(right.id, time, includePreview);
      return (left.layer + (left.baseZ + leftPose.z) * 0.15) -
        (right.layer + (right.baseZ + rightPose.z) * 0.15);
    });
    const view = viewMatrix();
    ordered.forEach((bone) => {
      const boneMatrix = matrices.get(bone.id);
      if (!boneMatrix) {
        return;
      }
      setCanvasMatrix(matrixMultiply(view, boneMatrix));
      const image = bone.asset ? state.images.get(bone.id) : null;
      if (!image && bone.shape) {
        drawBoneShape(bone, alpha);
        return;
      }
      if (!image) {
        return;
      }
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(
        image,
        -bone.width * bone.pivotX,
        -bone.height * bone.pivotY,
        bone.width,
        bone.height
      );
      ctx.restore();
    });
  }

  function rootPathPoints() {
    const rootId = state.character.rootId;
    const rootBone = boneById.get(rootId);
    if (!rootBone) {
      return [];
    }
    return (state.tracks[rootId] || []).map((key) => {
      const pose = transform(key.values);
      return {
        time: key.time,
        x: rootBone.x + pose.tx,
        y: rootBone.y + pose.ty
      };
    });
  }

  function drawMotionPath() {
    const points = rootPathPoints();
    if (!points.length) {
      return;
    }
    setCanvasMatrix(viewMatrix());
    ctx.save();
    ctx.lineWidth = 2 / Math.max(state.view.scale, 0.001);
    ctx.strokeStyle = "rgba(255, 209, 143, .88)";
    ctx.setLineDash([
      7 / Math.max(state.view.scale, 0.001),
      6 / Math.max(state.view.scale, 0.001)
    ]);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    if (points.length === 1) {
      ctx.lineTo(points[0].x + 0.01, points[0].y);
    } else {
      for (let index = 1; index < points.length; index += 1) {
        const current = points[index];
        const next = points[(index + 1) % points.length];
        const midpointX = (current.x + next.x) / 2;
        const midpointY = (current.y + next.y) / 2;
        ctx.quadraticCurveTo(current.x, current.y, midpointX, midpointY);
      }
      const first = points[0];
      ctx.quadraticCurveTo(first.x, first.y, points[0].x, points[0].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    points.forEach((point) => {
      const current = circularTimeDistance(point.time, state.currentTime) < 0.6;
      ctx.fillStyle = current ? "#fff1d5" : "#ffad55";
      ctx.strokeStyle = "#3a1e0d";
      ctx.lineWidth = 1.5 / Math.max(state.view.scale, 0.001);
      ctx.beginPath();
      ctx.arc(
        point.x,
        point.y,
        (current ? 7 : 5) / Math.max(state.view.scale, 0.001),
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawSkeleton(matrices, alpha = 1) {
    const view = viewMatrix();
    setCanvasMatrix(view);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2 / Math.max(state.view.scale, 0.001);

    bones.forEach((bone) => {
      if (!bone.parent) {
        return;
      }
      const matrix = matrices.get(bone.id);
      const parentMatrix = matrices.get(bone.parent);
      const point = pointThrough(matrix, 0, 0);
      const parentPoint = pointThrough(parentMatrix, 0, 0);
      ctx.strokeStyle = bone.id === state.selectedBoneId ? "#ffe0a4" : "rgba(120, 215, 233, .76)";
      ctx.beginPath();
      ctx.moveTo(parentPoint.x, parentPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    });

    bones.forEach((bone) => {
      const matrix = matrices.get(bone.id);
      const point = pointThrough(matrix, 0, 0);
      const selected = bone.id === state.selectedBoneId;
      ctx.fillStyle = selected ? "#ffad55" : "#78d7e9";
      ctx.strokeStyle = selected ? "#fff2d8" : "#102b31";
      ctx.lineWidth = (selected ? 2 : 1.5) / Math.max(state.view.scale, 0.001);
      ctx.beginPath();
      ctx.arc(point.x, point.y, (selected ? 6 : 4) / Math.max(state.view.scale, 0.001), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();

    const selectedMatrix = matrices.get(state.selectedBoneId);
    if (selectedMatrix) {
      setCanvasMatrix(matrixMultiply(view, selectedMatrix));
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 2 / Math.max(state.view.scale, 0.001);
      ctx.strokeStyle = "#ff8b68";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(30, 0);
      ctx.stroke();
      ctx.strokeStyle = "#75deed";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 30);
      ctx.stroke();
      ctx.restore();
    }
  }

  function gizmoGeometry(matrices = state.matrices) {
    const targetId = state.currentTool === "whole" || state.currentTool === "path"
      ? state.character.rootId
      : state.selectedBoneId;
    const matrix = matrices.get(targetId);
    if (!matrix) {
      return null;
    }
    const point = pointThrough(matrix, 0, 0);
    const unit = 1 / Math.max(state.view.scale, 0.001);
    const rotationAngle = -Math.PI / 4;
    const rotationRadius = 52 * unit;
    const pose = poseForBone(targetId, state.currentTime, true);
    return {
      targetId,
      point,
      unit,
      rotationValue: pose.rz,
      depthValue: pose.z,
      rotationRadius,
      rotateHandle: {
        x: point.x + Math.cos(rotationAngle) * rotationRadius,
        y: point.y + Math.sin(rotationAngle) * rotationRadius
      },
      moveHandle: { x: point.x, y: point.y },
      tiltHandle: { x: point.x - 68 * unit, y: point.y },
      depthTop: { x: point.x + 78 * unit, y: point.y - 47 * unit },
      depthBottom: { x: point.x + 78 * unit, y: point.y + 47 * unit },
      depthHandle: {
        x: point.x + 78 * unit,
        y: point.y - clamp(pose.z / 160, -1, 1) * 39 * unit
      },
      layerFront: { x: point.x + 118 * unit, y: point.y - 23 * unit },
      layerBack: { x: point.x + 118 * unit, y: point.y + 23 * unit }
    };
  }

  function drawToolGizmo(matrices) {
    const geometry = gizmoGeometry(matrices);
    if (!geometry || state.isPlaying || state.currentTool === "hand") {
      return;
    }
    const {
      targetId,
      point,
      unit,
      rotationValue,
      depthValue,
      rotationRadius,
      rotateHandle,
      moveHandle,
      tiltHandle,
      depthTop,
      depthBottom,
      depthHandle,
      layerFront,
      layerBack
    } = geometry;
    setCanvasMatrix(viewMatrix());
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Selected-bone label.
    ctx.font = `800 ${10 * unit}px Inter, "Noto Sans Myanmar", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const selectedLabel = boneById.get(targetId)?.shortName || "Selected";
    const labelY = point.y - 77 * unit;
    ctx.fillStyle = "rgba(12, 9, 7, .84)";
    ctx.fillRect(
      point.x - 50 * unit,
      labelY - 11 * unit,
      100 * unit,
      22 * unit
    );
    ctx.fillStyle = "#fff0d5";
    ctx.fillText(selectedLabel, point.x, labelY);

    // Orange rotation ring and direct rotation knob.
    ctx.lineWidth = (state.currentTool === "rotate" ? 4 : 2.5) * unit;
    ctx.strokeStyle = "#ffad55";
    ctx.globalAlpha = state.currentTool === "rotate" ? 1 : 0.86;
    ctx.beginPath();
    ctx.arc(point.x, point.y, rotationRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ffad55";
    ctx.strokeStyle = "#42230e";
    ctx.lineWidth = 2 * unit;
    ctx.beginPath();
    ctx.arc(rotateHandle.x, rotateHandle.y, 13 * unit, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#2b1709";
    ctx.font = `900 ${15 * unit}px system-ui`;
    ctx.fillText("↻", rotateHandle.x, rotateHandle.y + 0.5 * unit);
    ctx.fillStyle = "#ffd18f";
    ctx.font = `850 ${7 * unit}px Inter, sans-serif`;
    ctx.fillText("ROTATE", rotateHandle.x, rotateHandle.y - 19 * unit);
    ctx.fillText(`${Math.round(rotationValue)}°`, rotateHandle.x, rotateHandle.y + 20 * unit);

    // Cyan center point: direct X/Y move.
    ctx.fillStyle = "#78d7e9";
    ctx.strokeStyle = "#123941";
    ctx.lineWidth = 2 * unit;
    ctx.beginPath();
    ctx.arc(moveHandle.x, moveHandle.y, 13 * unit, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#123941";
    ctx.font = `900 ${14 * unit}px system-ui`;
    ctx.fillText("✥", moveHandle.x, moveHandle.y);

    // Purple 2.5D tilt point.
    ctx.strokeStyle = "rgba(191, 139, 255, .8)";
    ctx.lineWidth = 2 * unit;
    ctx.beginPath();
    ctx.moveTo(point.x - 51 * unit, point.y);
    ctx.lineTo(tiltHandle.x, tiltHandle.y);
    ctx.stroke();
    ctx.fillStyle = "#c59aff";
    ctx.beginPath();
    ctx.moveTo(tiltHandle.x, tiltHandle.y - 12 * unit);
    ctx.lineTo(tiltHandle.x + 12 * unit, tiltHandle.y);
    ctx.lineTo(tiltHandle.x, tiltHandle.y + 12 * unit);
    ctx.lineTo(tiltHandle.x - 12 * unit, tiltHandle.y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#eadcff";
    ctx.font = `850 ${7 * unit}px Inter, sans-serif`;
    ctx.fillText("2.5D", tiltHandle.x, tiltHandle.y + 21 * unit);

    // Green depth rail: up means front, down means back.
    ctx.strokeStyle = "#88e6a8";
    ctx.lineWidth = 3 * unit;
    ctx.beginPath();
    ctx.moveTo(depthTop.x, depthTop.y);
    ctx.lineTo(depthBottom.x, depthBottom.y);
    ctx.stroke();
    ctx.fillStyle = "#b7f2ca";
    ctx.beginPath();
    ctx.moveTo(depthTop.x, depthTop.y - 5 * unit);
    ctx.lineTo(depthTop.x - 6 * unit, depthTop.y + 6 * unit);
    ctx.lineTo(depthTop.x + 6 * unit, depthTop.y + 6 * unit);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(depthBottom.x, depthBottom.y + 5 * unit);
    ctx.lineTo(depthBottom.x - 6 * unit, depthBottom.y - 6 * unit);
    ctx.lineTo(depthBottom.x + 6 * unit, depthBottom.y - 6 * unit);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#88e6a8";
    ctx.strokeStyle = "#173a23";
    ctx.lineWidth = 2 * unit;
    ctx.beginPath();
    ctx.moveTo(depthHandle.x, depthHandle.y - 11 * unit);
    ctx.lineTo(depthHandle.x + 11 * unit, depthHandle.y);
    ctx.lineTo(depthHandle.x, depthHandle.y + 11 * unit);
    ctx.lineTo(depthHandle.x - 11 * unit, depthHandle.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#c8f6d7";
    ctx.font = `850 ${7 * unit}px Inter, sans-serif`;
    ctx.fillText("FRONT", depthTop.x, depthTop.y - 13 * unit);
    ctx.fillText("BACK", depthBottom.x, depthBottom.y + 14 * unit);
    ctx.textAlign = "right";
    ctx.fillText(`Z ${Math.round(depthValue)}`, depthHandle.x - 16 * unit, depthHandle.y);
    ctx.textAlign = "center";

    // One-tap layer steps.
    ctx.fillStyle = "rgba(18, 14, 10, .9)";
    ctx.strokeStyle = "#f5d57e";
    ctx.lineWidth = 2 * unit;
    [layerFront, layerBack].forEach((handle) => {
      ctx.beginPath();
      ctx.arc(handle.x, handle.y, 14 * unit, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    ctx.fillStyle = "#ffe29b";
    ctx.font = `900 ${17 * unit}px system-ui`;
    ctx.fillText("+", layerFront.x, layerFront.y);
    ctx.fillText("−", layerBack.x, layerBack.y - 1 * unit);
    ctx.font = `850 ${6.5 * unit}px Inter, sans-serif`;
    ctx.fillText("LAYER", layerFront.x, point.y - 44 * unit);
    ctx.fillStyle = "#f5d57e";
    ctx.fillText("FRONT", layerFront.x, layerFront.y - 20 * unit);
    ctx.fillText("BACK", layerBack.x, layerBack.y + 20 * unit);

    ctx.restore();
  }

  function drawRigAt(time, alpha, includePreview) {
    const matrices = buildMatrices(time, includePreview);
    drawGroundShadow(matrices, alpha);
    drawArt(matrices, time, alpha, includePreview);
    return matrices;
  }

  function render() {
    resizeCanvas();
    const width = state.view.width;
    const height = state.view.height;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, dom.canvas.width, dom.canvas.height);

    if (state.showOnion && !state.isPlaying) {
      const step = state.snapFps ? 1000 / state.snapFps : 80;
      drawRigAt(state.currentTime - step, 0.12, false);
      drawRigAt(state.currentTime + step, 0.12, false);
    }

    state.matrices = drawRigAt(state.currentTime, 1, true);
    if (state.currentTool === "path") {
      drawMotionPath();
    }
    if (state.showSkeleton) {
      drawSkeleton(state.matrices, 1);
    }
    drawToolGizmo(state.matrices);

    state.dirty = false;
  }

  function animationLoop(now) {
    if (state.isPlaying) {
      state.currentTime = normalizeTime(now - state.playStart);
      state.previewOverrides = {};
      if (now - state.lastUiUpdate >= 32) {
        updateTimeUI();
        state.lastUiUpdate = now;
      }
      state.dirty = true;
    }
    if (state.dirty) {
      render();
    }
    state.rafId = requestAnimationFrame(animationLoop);
  }

  function loadImages() {
    const jobs = bones.filter((bone) => bone.asset).map((bone) => new Promise((resolve) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        state.images.set(bone.id, image);
        resolve();
      };
      image.onerror = () => {
        state.imageFailures += 1;
        resolve();
      };
      image.src = bone.asset;
    }));

    Promise.all(jobs).then(() => {
      dom.stageLoading.classList.add("hidden");
      dom.renderStatus.textContent = state.imageFailures ? `${state.imageFailures} PARTS MISSING` : "READY";
      state.dirty = true;
    });
  }

  function hierarchyDepth(bone) {
    let depth = 0;
    let parent = bone.parent;
    while (parent) {
      depth += 1;
      parent = boneById.get(parent)?.parent || null;
    }
    return depth;
  }

  function renderHierarchy() {
    dom.boneList.textContent = "";
    bones.forEach((bone) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `bone-item${bone.id === state.selectedBoneId ? " selected" : ""}`;
      button.style.setProperty("--depth", hierarchyDepth(bone));
      button.setAttribute("role", "treeitem");
      button.setAttribute("aria-selected", String(bone.id === state.selectedBoneId));
      button.dataset.boneId = bone.id;

      const icon = document.createElement("span");
      icon.className = "bone-icon";
      icon.textContent = bone.parent ? "◇" : "◆";
      const name = document.createElement("span");
      name.className = "bone-name";
      name.textContent = bone.shortName;
      const keyCount = document.createElement("span");
      keyCount.className = "bone-keys";
      keyCount.textContent = String(state.tracks[bone.id]?.length || 0);

      button.append(icon, name, keyCount);
      button.addEventListener("click", () => selectBone(bone.id));
      dom.boneList.append(button);
    });
    dom.boneCount.textContent = String(bones.length);
  }

  function renderRuler() {
    dom.timelineRuler.textContent = "";
    const divisions = 8;
    for (let index = 0; index <= divisions; index += 1) {
      const mark = document.createElement("div");
      mark.className = "ruler-mark";
      mark.style.left = `${index / divisions * 100}%`;
      const label = document.createElement("span");
      label.textContent = `${Math.round(state.duration * index / divisions)}ms`;
      mark.append(label);
      dom.timelineRuler.append(mark);
    }
  }

  function renderTimeline() {
    dom.tracksBody.textContent = "";
    bones.forEach((bone) => {
      const row = document.createElement("div");
      row.className = `track-row${bone.id === state.selectedBoneId ? " selected" : ""}`;
      row.dataset.boneId = bone.id;

      const label = document.createElement("button");
      label.type = "button";
      label.className = "track-label";
      label.textContent = bone.shortName;
      label.addEventListener("click", () => selectBone(bone.id));

      const lane = document.createElement("div");
      lane.className = "track-lane";
      lane.addEventListener("pointerdown", (event) => {
        if (event.target !== lane) {
          return;
        }
        const rectangle = lane.getBoundingClientRect();
        const ratio = clamp((event.clientX - rectangle.left) / Math.max(1, rectangle.width), 0, 1);
        selectBone(bone.id, false);
        seek(snapTime(ratio * state.duration));
      });

      (state.tracks[bone.id] || []).forEach((key) => {
        const marker = document.createElement("button");
        marker.type = "button";
        marker.className = "key-diamond";
        if (circularTimeDistance(key.time, state.currentTime) < 0.6) {
          marker.classList.add("current");
        }
        marker.style.left = `${key.time / state.duration * 100}%`;
        marker.title = `${bone.name} · ${formatMilliseconds(key.time)}`;
        marker.setAttribute("aria-label", marker.title);
        marker.addEventListener("click", (event) => {
          event.stopPropagation();
          selectBone(bone.id, false);
          seek(key.time);
        });
        lane.append(marker);
      });

      row.append(label, lane);
      dom.tracksBody.append(row);
    });

    const playhead = document.createElement("div");
    playhead.className = "timeline-playhead";
    playhead.id = "timelinePlayhead";
    playhead.setAttribute("aria-hidden", "true");
    dom.tracksBody.append(playhead);
    dom.timelinePlayhead = playhead;
    renderRuler();
    updatePlayhead();
    updateCounts();
  }

  function circularTimeDistance(left, right) {
    const distance = Math.abs(normalizeTime(left) - normalizeTime(right));
    return Math.min(distance, state.duration - distance);
  }

  function updatePlayhead() {
    if (!dom.timelinePlayhead) {
      return;
    }
    const bodyWidth = Math.max(LABEL_WIDTH, dom.tracksBody.clientWidth);
    const laneWidth = Math.max(1, bodyWidth - LABEL_WIDTH);
    const ratio = normalizeTime(state.currentTime) / state.duration;
    dom.timelinePlayhead.style.left = `${LABEL_WIDTH + ratio * laneWidth}px`;
    dom.timelineScrubber.value = String(Math.round(normalizeTime(state.currentTime)));

    if (state.isPlaying) {
      return;
    }
    dom.tracksBody.querySelectorAll(".key-diamond.current").forEach((marker) => {
      marker.classList.remove("current");
    });
    const selectedRow = dom.tracksBody.querySelector(`[data-bone-id="${state.selectedBoneId}"]`);
    if (selectedRow) {
      const keys = state.tracks[state.selectedBoneId] || [];
      const markers = selectedRow.querySelectorAll(".key-diamond");
      keys.forEach((key, index) => {
        if (circularTimeDistance(key.time, state.currentTime) < 0.6) {
          markers[index]?.classList.add("current");
        }
      });
    }
  }

  function formatMilliseconds(time) {
    const value = Math.max(0, Math.round(time));
    const seconds = Math.floor(value / 1000);
    const milliseconds = value % 1000;
    return `${seconds}.${String(milliseconds).padStart(3, "0")}s`;
  }

  function formatTimecode(time) {
    const value = Math.max(0, Math.round(time));
    const minutes = Math.floor(value / 60000);
    const seconds = Math.floor(value % 60000 / 1000);
    const milliseconds = value % 1000;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}:${String(milliseconds).padStart(3, "0")}`;
  }

  function updateRangeFill(input) {
    const minimum = Number(input.min);
    const maximum = Number(input.max);
    const ratio = (Number(input.value) - minimum) / Math.max(0.0001, maximum - minimum);
    input.style.setProperty("--fill", `${clamp(ratio, 0, 1) * 100}%`);
  }

  function displayValue(prop, value) {
    if (prop === "rz" || prop === "ry") {
      return `${value.toFixed(1).replace(".0", "")}°`;
    }
    if (prop === "scale") {
      return `${value.toFixed(2)}×`;
    }
    return String(Math.round(value));
  }

  function updateInspector() {
    const bone = boneById.get(state.selectedBoneId);
    if (!bone) {
      return;
    }
    const pose = poseForBone(bone.id, state.currentTime, true);
    dom.selectedBoneName.textContent = bone.name;
    dom.selectedStatus.textContent = bone.shortName;
    dom.propertyInputs.forEach((input) => {
      const prop = input.dataset.prop;
      input.value = String(pose[prop]);
      updateRangeFill(input);
    });
    dom.propertyOutputs.forEach((output) => {
      const prop = output.dataset.output;
      output.textContent = displayValue(prop, pose[prop]);
    });
    const keyExists = findKeyIndex(bone.id, snapTime(state.currentTime)) >= 0;
    dom.deleteKeyButton.disabled = !keyExists;
  }

  function updateTimeUI() {
    const time = normalizeTime(state.currentTime);
    dom.timecode.textContent = formatTimecode(time);
    const displayFps = state.snapFps || 60;
    const frame = Math.round(time / (1000 / displayFps));
    dom.frameReadout.textContent = `Frame ${String(frame).padStart(3, "0")} · ${Math.round(time)} ms`;
    updatePlayhead();
    if (!state.isPlaying) {
      updateInspector();
    }
  }

  function updateCounts() {
    const count = bones.reduce((sum, bone) => sum + (state.tracks[bone.id]?.length || 0), 0);
    dom.keyCountStatus.textContent = `${count} keyframes`;
  }

  function clipKeyCount(clip) {
    return bones.reduce((sum, bone) => sum + (clip.tracks[bone.id]?.length || 0), 0);
  }

  function renderClipBar() {
    if (!dom.clipTabs) {
      return;
    }
    commitLive();
    dom.clipTabs.textContent = "";
    state.clips.forEach((clip) => {
      const active = clip.id === state.activeClipId;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `clip-tab${active ? " active" : ""}`;
      button.dataset.clipId = clip.id;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(active));
      button.title = "Click to switch · double-click to rename";

      const name = document.createElement("span");
      name.className = "clip-tab-name";
      name.textContent = clip.name;
      const meta = document.createElement("span");
      meta.className = "clip-tab-meta";
      meta.textContent = `${Math.round(clip.duration)}ms · ${clipKeyCount(clip)} keys`;

      button.append(name, meta);
      button.addEventListener("click", () => selectClip(clip.id));
      button.addEventListener("dblclick", () => {
        selectClip(clip.id);
        renameActiveClip();
      });
      dom.clipTabs.append(button);
    });

    const activeClip = getActiveClip();
    if (dom.activeClipLabel && activeClip) {
      dom.activeClipLabel.textContent = activeClip.name.toUpperCase();
    }
    if (dom.deleteClipButton) {
      dom.deleteClipButton.disabled = state.clips.length <= 1;
    }

    const activeTab = dom.clipTabs.querySelector(".clip-tab.active");
    if (activeTab) {
      activeTab.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  function refreshAfterClipChange() {
    state.currentTime = 0;
    state.previewOverrides = {};
    syncProjectControls();
    renderClipBar();
    renderHierarchy();
    renderTimeline();
    updateTimeUI();
    updateInspector();
    scheduleAutosave();
    updateUndoButtons();
    state.dirty = true;
  }

  function selectClip(clipId) {
    if (clipId === state.activeClipId || !state.clips.some((clip) => clip.id === clipId)) {
      return;
    }
    pause();
    commitLive();
    state.activeClipId = clipId;
    loadClipIntoLive(getActiveClip());
    refreshAfterClipChange();
    dom.gestureReadout.textContent = `CLIP · ${getActiveClip().name}`;
  }

  function insertClip(clip, afterActive = true) {
    const index = afterActive
      ? state.clips.findIndex((item) => item.id === state.activeClipId)
      : state.clips.length - 1;
    state.clips.splice(index + 1, 0, clip);
    state.activeClipId = clip.id;
    loadClipIntoLive(clip);
  }

  function createClip() {
    pause();
    checkpoint();
    commitLive();
    const clip = makeClip(
      { id: uniqueClipId(), name: nextActionName(), duration: 1600, snapFps: state.snapFps, tracks: {} },
      nextActionName()
    );
    insertClip(clip);
    refreshAfterClipChange();
    dom.gestureReadout.textContent = `CLIP · New action “${clip.name}”`;
  }

  function duplicateActiveClip() {
    pause();
    checkpoint();
    commitLive();
    const base = getActiveClip();
    const clip = makeClip(
      {
        id: uniqueClipId(),
        name: nextCopyName(base.name),
        duration: base.duration,
        snapFps: base.snapFps,
        autoOrientPath: base.autoOrientPath,
        pathAngleOffset: base.pathAngleOffset,
        tracks: base.tracks
      },
      nextCopyName(base.name)
    );
    insertClip(clip);
    refreshAfterClipChange();
    dom.gestureReadout.textContent = `CLIP · Duplicated as “${clip.name}”`;
  }

  function deleteActiveClip() {
    if (state.clips.length <= 1) {
      dom.gestureReadout.textContent = "CLIP · At least one action is required";
      return;
    }
    pause();
    checkpoint();
    const index = state.clips.findIndex((clip) => clip.id === state.activeClipId);
    const removed = state.clips.splice(index, 1)[0];
    const next = state.clips[Math.min(index, state.clips.length - 1)];
    state.activeClipId = next.id;
    loadClipIntoLive(next);
    refreshAfterClipChange();
    dom.gestureReadout.textContent = `CLIP · Deleted “${removed.name}”`;
  }

  function renameActiveClip() {
    const clip = getActiveClip();
    if (!clip) {
      return;
    }
    const input = window.prompt("Action name", clip.name);
    if (input === null) {
      return;
    }
    const name = input.trim().slice(0, 40) || clip.name;
    if (name === clip.name) {
      return;
    }
    checkpoint();
    clip.name = name;
    renderClipBar();
    syncProjectControls();
    scheduleAutosave();
    updateUndoButtons();
    dom.gestureReadout.textContent = `CLIP · Renamed to “${name}”`;
  }

  function selectBone(boneId, refreshTimeline = true) {
    if (!boneById.has(boneId)) {
      return;
    }
    state.selectedBoneId = boneId;
    state.previewOverrides = {};
    renderHierarchy();
    if (refreshTimeline) {
      renderTimeline();
    } else {
      dom.tracksBody.querySelectorAll(".track-row").forEach((row) => {
        row.classList.toggle("selected", row.dataset.boneId === boneId);
      });
    }
    updateInspector();
    state.dirty = true;
  }

  function seek(time) {
    pause();
    state.currentTime = normalizeTime(time);
    state.previewOverrides = {};
    updateTimeUI();
    state.dirty = true;
  }

  function play() {
    if (state.isPlaying) {
      pause();
      return;
    }
    state.previewOverrides = {};
    state.isPlaying = true;
    state.playStart = performance.now() - normalizeTime(state.currentTime);
    dom.playIcon.textContent = "❚❚";
    dom.playButton.setAttribute("aria-label", "Pause animation");
    dom.renderStatus.textContent = "PLAYING";
  }

  function pause() {
    if (!state.isPlaying) {
      return;
    }
    state.isPlaying = false;
    dom.playIcon.textContent = "▶";
    dom.playButton.setAttribute("aria-label", "Play animation");
    dom.renderStatus.textContent = state.imageFailures ? `${state.imageFailures} PARTS MISSING` : "READY";
    updateInspector();
    state.dirty = true;
  }

  function stop() {
    pause();
    state.currentTime = 0;
    state.previewOverrides = {};
    updateTimeUI();
    state.dirty = true;
  }

  function findKeyIndex(boneId, time) {
    const track = state.tracks[boneId] || [];
    return track.findIndex((key) => circularTimeDistance(key.time, time) < 0.6);
  }

  function upsertKey(boneId, time, values) {
    const keyTime = snapTime(time);
    if (!state.tracks[boneId]) {
      state.tracks[boneId] = [];
    }
    const index = findKeyIndex(boneId, keyTime);
    const key = {
      time: keyTime,
      values: transform(values)
    };
    if (index >= 0) {
      state.tracks[boneId][index] = key;
    } else {
      state.tracks[boneId].push(key);
      state.tracks[boneId].sort((left, right) => left.time - right.time);
    }
    state.currentTime = keyTime;
  }

  /*
   * AI AUTO-ASSIST — when enabled, finishing an edit on a bone spreads an
   * eased fraction of that change into the neighbouring keyframes (the same
   * frames the onion skin shows) and adds a damped follow-through to the
   * bone's direct children, so the surrounding motion stays smooth without
   * ever overwriting the pose the user just set. Every adjustment happens
   * inside the caller's undo checkpoint, so one Undo reverts everything.
   */
  const ASSIST_NEIGHBOR_WEIGHT = 0.35;   // eased pull applied to prev/next keys
  const ASSIST_CHILD_WEIGHT = 0.18;      // damped follow-through on child bones
  const ASSIST_MIN_DELTA = 0.75;         // ignore micro-adjustments

  function assistNeighborIndexes(track, time) {
    if (!Array.isArray(track) || track.length < 2) {
      return [];
    }
    const currentIndex = track.findIndex((key) => circularTimeDistance(key.time, time) < 0.6);
    const result = new Set();
    if (currentIndex >= 0) {
      result.add((currentIndex - 1 + track.length) % track.length);
      result.add((currentIndex + 1) % track.length);
      result.delete(currentIndex);
    } else {
      // No key exactly here (e.g. child bone): take the nearest key on each side.
      let previous = track.length - 1;
      let next = 0;
      for (let index = 0; index < track.length - 1; index += 1) {
        if (time > track[index].time && time < track[index + 1].time) {
          previous = index;
          next = index + 1;
          break;
        }
      }
      result.add(previous);
      result.add(next);
    }
    return [...result].filter((index) => circularTimeDistance(track[index].time, time) > 0.6);
  }

  function assistFalloff(track, index, time) {
    const step = state.snapFps ? 1000 / state.snapFps : 80;
    const distance = Math.max(step, circularTimeDistance(track[index].time, time));
    // Adjacent frame gets the full weight; farther keys ease away smoothly.
    return smoothstep(clamp(step / distance, 0, 1));
  }

  function assistBlendKey(track, index, delta, weight) {
    const values = transform(track[index].values);
    const blended = {};
    TRANSFORM_PROPS.forEach((prop) => {
      blended[prop] = values[prop] + (delta[prop] || 0) * weight;
    });
    track[index] = { time: track[index].time, values: transform(blended) };
  }

  function applyAiAssist(boneId, beforeValues) {
    if (!state.aiAssist || !beforeValues) {
      return 0;
    }
    const time = snapTime(state.currentTime);
    const track = state.tracks[boneId];
    const keyIndex = findKeyIndex(boneId, time);
    if (!track || keyIndex < 0) {
      return 0;
    }
    const before = transform(beforeValues);
    const after = transform(track[keyIndex].values);
    const delta = {};
    let magnitude = 0;
    TRANSFORM_PROPS.forEach((prop) => {
      const change = prop === "rz" || prop === "ry"
        ? shortestAngleDelta(before[prop], after[prop])
        : after[prop] - before[prop];
      delta[prop] = change;
      magnitude += Math.abs(change) * (prop === "scale" ? 60 : 1);
    });
    if (magnitude < ASSIST_MIN_DELTA) {
      return 0;
    }

    let touched = 0;

    // 1) Ease the bone's own neighbouring keyframes toward the new pose.
    assistNeighborIndexes(track, time).forEach((index) => {
      assistBlendKey(track, index, delta, ASSIST_NEIGHBOR_WEIGHT * assistFalloff(track, index, time));
      touched += 1;
    });

    // 2) Damped follow-through on direct children (rotation only), applied to
    //    their neighbouring keys — never the current frame, so a pose the user
    //    authored on a child is left untouched.
    if (Math.abs(delta.rz) >= 1) {
      const childDelta = { rz: -delta.rz * ASSIST_CHILD_WEIGHT };
      (childrenByParent.get(boneId) || []).forEach((child) => {
        const childTrack = state.tracks[child.id];
        assistNeighborIndexes(childTrack, time).forEach((index) => {
          assistBlendKey(childTrack, index, childDelta, assistFalloff(childTrack, index, time));
          touched += 1;
        });
      });
    }

    if (touched) {
      dom.gestureReadout.textContent =
        `✨ AI ASSIST · eased ${touched} neighbouring key${touched > 1 ? "s" : ""} around ${Math.round(time)}ms`;
    }
    return touched;
  }

  function updateAiAssistUI() {
    if (!dom.aiAssistToggle) {
      return;
    }
    dom.aiAssistToggle.classList.toggle("active", state.aiAssist);
    dom.aiAssistToggle.setAttribute("aria-pressed", String(state.aiAssist));
  }

  function addOrUpdateKey() {
    pause();
    checkpoint();
    const before = sampleTrack(state.tracks[state.selectedBoneId], state.currentTime);
    const values = poseForBone(state.selectedBoneId, state.currentTime, true);
    upsertKey(state.selectedBoneId, state.currentTime, values);
    applyAiAssist(state.selectedBoneId, before);
    state.previewOverrides = {};
    projectChanged();
  }

  function deleteCurrentKey() {
    pause();
    const keyTime = snapTime(state.currentTime);
    const index = findKeyIndex(state.selectedBoneId, keyTime);
    if (index < 0) {
      return;
    }
    checkpoint();
    state.tracks[state.selectedBoneId].splice(index, 1);
    state.previewOverrides = {};
    projectChanged();
  }

  function resetCurrentTransform() {
    pause();
    const reset = { ...DEFAULT_TRANSFORM };
    if (dom.autoKeyToggle.checked) {
      checkpoint();
      upsertKey(state.selectedBoneId, state.currentTime, reset);
      projectChanged();
    } else {
      state.previewOverrides[state.selectedBoneId] = reset;
      updateInspector();
      state.dirty = true;
    }
  }

  function projectSnapshot() {
    commitLive();
    return JSON.stringify({
      activeClipId: state.activeClipId,
      clips: state.clips.map(serializeClip)
    });
  }

  function checkpoint(snapshot = projectSnapshot()) {
    if (state.undoStack[state.undoStack.length - 1] !== snapshot) {
      state.undoStack.push(snapshot);
      if (state.undoStack.length > 50) {
        state.undoStack.shift();
      }
    }
    state.redoStack = [];
    updateUndoButtons();
  }

  function restoreSnapshot(snapshot) {
    try {
      const project = JSON.parse(snapshot);
      applyProjectData(project, false);
      if (!boneById.has(state.selectedBoneId)) {
        state.selectedBoneId = state.character.rootId;
      }
      syncProjectControls();
      renderClipBar();
      renderHierarchy();
      renderTimeline();
      updateInspector();
      state.dirty = true;
      scheduleAutosave();
    } catch (error) {
      console.warn("Could not restore rig snapshot", error);
    }
  }

  function undo() {
    if (!state.undoStack.length) {
      return;
    }
    state.redoStack.push(projectSnapshot());
    restoreSnapshot(state.undoStack.pop());
    updateUndoButtons();
  }

  function redo() {
    if (!state.redoStack.length) {
      return;
    }
    state.undoStack.push(projectSnapshot());
    restoreSnapshot(state.redoStack.pop());
    updateUndoButtons();
  }

  function updateUndoButtons() {
    dom.undoButton.disabled = !state.undoStack.length;
    dom.redoButton.disabled = !state.redoStack.length;
  }

  function projectChanged() {
    renderClipBar();
    renderHierarchy();
    renderTimeline();
    updateTimeUI();
    updateInspector();
    state.dirty = true;
    scheduleAutosave();
    updateUndoButtons();
  }

  function sanitizeTracks(input, duration) {
    const output = {};
    bones.forEach((bone) => {
      const source = Array.isArray(input?.[bone.id]) ? input[bone.id] : [];
      const unique = new Map();
      source.forEach((key) => {
        const rawTime = finiteOr(key?.time, -1);
        if (rawTime < 0) {
          return;
        }
        const time = Math.round((rawTime % duration) * 1000) / 1000;
        unique.set(time, {
          time,
          values: transform(key?.values)
        });
      });
      output[bone.id] = [...unique.values()].sort((left, right) => left.time - right.time);
    });
    return output;
  }

  function scheduleAutosave() {
    window.clearTimeout(state.saveTimer);
    dom.saveState.textContent = "Saving locally…";
    state.saveTimer = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, fullSnapshot());
        dom.saveState.textContent = "Saved locally";
      } catch (error) {
        dom.saveState.textContent = "Autosave unavailable";
      }
    }, 180);
  }

  function loadAutosave() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        applyFullModel(JSON.parse(saved), true);
        dom.saveState.textContent = "Autosave restored";
        return;
      }
      // One-time migration from the previous single-character (v2) autosave.
      const legacy = localStorage.getItem("astro-rooster-rig-editor-v2");
      if (legacy) {
        const parsed = JSON.parse(legacy);
        applyFullModel({ activeCharacterId: "mal", clips: parsed.clips, activeClipId: parsed.activeClipId }, true);
        dom.saveState.textContent = "Migrated earlier project";
        return;
      }
      applyFullModel({}, true);
      dom.saveState.textContent = "New local project";
    } catch (error) {
      applyFullModel({}, true);
      dom.saveState.textContent = "New local project";
    }
  }

  function exportProject() {
    commitLive();
    const activeClip = getActiveClip();
    const project = {
      format: "astro-rooster-rig",
      version: 2,
      generator: "Astro Rooster 2.5D Rig Editor",
      designSize: {
        width: DESIGN_WIDTH,
        height: DESIGN_HEIGHT
      },
      bones: bones.map((bone) => ({
        id: bone.id,
        parent: bone.parent,
        asset: bone.asset,
        joint: {
          x: bone.x,
          y: bone.y,
          pivotX: bone.pivotX,
          pivotY: bone.pivotY,
          baseRz: bone.baseRz,
          baseZ: bone.baseZ,
          layer: bone.layer
        }
      })),
      activeClipId: state.activeClipId,
      clips: state.clips.map(serializeClip),
      // Kept for tools that still read the single-clip v1 shape.
      duration: activeClip.duration,
      snapFps: activeClip.snapFps,
      autoOrientPath: activeClip.autoOrientPath,
      pathAngleOffset: activeClip.pathAngleOffset,
      tracks: activeClip.tracks
    };
    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: "application/json"
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "astro-rooster-rig-project.json";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function importProject(file) {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const project = JSON.parse(String(reader.result));
        if (project.format && project.format !== "astro-rooster-rig") {
          throw new Error("Unsupported rig format");
        }
        checkpoint();
        applyProjectData(project, true);
        if (!boneById.has(state.selectedBoneId)) {
          state.selectedBoneId = state.character.rootId;
        }
        syncProjectControls();
        projectChanged();
        dom.saveState.textContent = `Imported ${file.name}`;
      } catch (error) {
        dom.saveState.textContent = "Import failed: invalid rig JSON";
      }
      dom.importInput.value = "";
    };
    reader.readAsText(file);
  }

  function syncProjectControls() {
    dom.durationInput.value = String(Math.round(state.duration));
    dom.timelineScrubber.max = String(Math.round(state.duration));
    dom.durationLabel.textContent = `${Math.round(state.duration)} ms`;
    dom.snapSelect.value = String(state.snapFps);
    dom.autoOrientPathToggle.checked = state.autoOrientPath;
    dom.pathAngleOffset.value = String(state.pathAngleOffset);
    dom.pathAngleOffsetOutput.textContent = displayValue("rz", state.pathAngleOffset);
    updateRangeFill(dom.pathAngleOffset);
    const activeClip = getActiveClip();
    if (dom.activeClipLabel && activeClip) {
      dom.activeClipLabel.textContent = activeClip.name.toUpperCase();
    }
  }

  function changeDuration() {
    const nextDuration = clamp(finiteOr(dom.durationInput.value, state.duration), 400, 10000);
    if (nextDuration === state.duration) {
      syncProjectControls();
      return;
    }
    checkpoint();
    const ratio = nextDuration / state.duration;
    bones.forEach((bone) => {
      state.tracks[bone.id] = (state.tracks[bone.id] || []).map((key) => ({
        time: Math.min(nextDuration - 0.001, Math.round(key.time * ratio * 1000) / 1000),
        values: transform(key.values)
      }));
    });
    state.duration = nextDuration;
    state.currentTime = normalizeTime(state.currentTime * ratio);
    syncProjectControls();
    projectChanged();
  }

  function jumpToKey(direction) {
    const keys = (state.tracks[state.selectedBoneId] || [])
      .map((key) => key.time)
      .sort((left, right) => left - right);
    if (!keys.length) {
      return;
    }
    const time = normalizeTime(state.currentTime);
    if (direction > 0) {
      const next = keys.find((keyTime) => keyTime > time + 0.6);
      seek(next === undefined ? keys[0] : next);
    } else {
      const previous = keys.slice().reverse().find((keyTime) => keyTime < time - 0.6);
      seek(previous === undefined ? keys[keys.length - 1] : previous);
    }
  }

  function isTextEntry(element) {
    return element instanceof HTMLInputElement ||
      element instanceof HTMLSelectElement ||
      element instanceof HTMLTextAreaElement ||
      element?.isContentEditable;
  }

  function handleKeyboard(event) {
    const modifier = event.ctrlKey || event.metaKey;
    if (modifier && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) {
        redo();
      } else {
        undo();
      }
      return;
    }
    if (isTextEntry(event.target)) {
      return;
    }
    if (event.code === "Space") {
      event.preventDefault();
      play();
    } else if (event.key.toLowerCase() === "k") {
      event.preventDefault();
      addOrUpdateKey();
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      deleteCurrentKey();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const direction = event.key === "ArrowLeft" ? -1 : 1;
      const step = state.snapFps ? 1000 / state.snapFps : 10;
      seek(state.currentTime + direction * step);
    } else if (event.key.toLowerCase() === "a") {
      event.preventDefault();
      dom.aiAssistToggle.click();
    } else if (event.key.toLowerCase() === "h") {
      event.preventDefault();
      setTool("hand");
    } else if (event.key.toLowerCase() === "f") {
      event.preventDefault();
      resetCamera();
    }
  }

  function toolInstruction(tool = state.currentTool) {
    const instructions = {
      hand: "HAND · Left-drag camera · middle mouse works in every tool",
      move: "MOVE · Drag a joint or body part",
      rotate: "ROTATE · Drag around the selected joint",
      tilt: "2.5D TILT · Drag left/right · vertical changes scale",
      depth: "DEPTH · Drag up for front · down for back",
      whole: "WHOLE RIG · One finger moves root · use handles to rotate/tilt",
      path: "PATH · Drag the root path point · use Auto Orient if needed"
    };
    return instructions[tool] || instructions.move;
  }

  function setControlCoach(visible) {
    state.showControlCoach = Boolean(visible);
    dom.controlCoach.classList.toggle("hidden", !state.showControlCoach);
    dom.controlHelpButton.classList.toggle("active", state.showControlCoach);
    dom.controlHelpButton.setAttribute("aria-pressed", String(state.showControlCoach));
  }

  function setTool(tool) {
    if (!["hand", "move", "rotate", "tilt", "depth", "whole", "path"].includes(tool)) {
      return;
    }
    pause();
    state.drag = null;
    state.activePointers.clear();
    state.cameraPointers.clear();
    state.cameraGesture = null;
    state.multiGesture = null;
    if (tool === "whole" || tool === "path") {
      selectBone(state.character.rootId);
    }
    activateToolUI(tool);
  }

  function activateToolUI(tool) {
    state.currentTool = tool;
    dom.canvas.style.cursor = tool === "hand" ? "grab" : "crosshair";
    dom.rigToolButtons.forEach((button) => {
      const active = button.dataset.tool === tool;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    dom.gestureReadout.textContent = toolInstruction(tool);
    state.dirty = true;
  }

  function pathRotationAt(time, fallback = 0) {
    const track = state.tracks[state.character.rootId] || [];
    if (track.length < 2) {
      return fallback;
    }
    const step = Math.max(20, state.snapFps ? 1000 / state.snapFps : 60);
    const before = sampleTrack(track, time - step);
    const after = sampleTrack(track, time + step);
    const deltaX = after.tx - before.tx;
    const deltaY = after.ty - before.ty;
    if (Math.hypot(deltaX, deltaY) < 0.05) {
      return fallback;
    }
    return Math.atan2(deltaY, deltaX) * 180 / Math.PI + state.pathAngleOffset;
  }

  function orientValuesToPath(values, time) {
    return transform({
      ...values,
      rz: pathRotationAt(time, values.rz)
    });
  }

  function orientCurrentKeyToPath() {
    pause();
    checkpoint();
    const rootId = state.character.rootId;
    const values = poseForBone(rootId, state.currentTime, true);
    upsertKey(rootId, state.currentTime, orientValuesToPath(values, state.currentTime));
    state.selectedBoneId = rootId;
    state.previewOverrides = {};
    projectChanged();
    dom.gestureReadout.textContent = `PATH ROTATION · ${displayValue("rz", poseForBone(rootId, state.currentTime).rz)}`;
  }

  function nudgeLayer(amount) {
    pause();
    const boneId = state.selectedBoneId;
    const values = poseForBone(boneId, state.currentTime, true);
    const next = transform({
      ...values,
      z: clamp(values.z + amount, -160, 160)
    });
    if (dom.autoKeyToggle.checked) {
      checkpoint();
      upsertKey(boneId, state.currentTime, next);
      projectChanged();
    } else {
      state.previewOverrides[boneId] = next;
      updateInspector();
      state.dirty = true;
    }
    dom.gestureReadout.textContent = `DEPTH · ${boneById.get(boneId).shortName} · Z ${Math.round(next.z)}`;
  }

  function pointerToCanvasPoint(event) {
    const rectangle = dom.canvas.getBoundingClientRect();
    return {
      x: event.clientX - rectangle.left,
      y: event.clientY - rectangle.top
    };
  }

  function pointerToWorld(event) {
    const canvasPoint = pointerToCanvasPoint(event);
    return {
      x: (canvasPoint.x - state.view.offsetX) / state.view.scale,
      y: (canvasPoint.y - state.view.offsetY) / state.view.scale
    };
  }

  function handleCanvasWheel(event) {
    if (state.drag || state.cameraGesture) {
      event.preventDefault();
      return;
    }
    const deltaUnit = event.deltaMode === 1
      ? 16
      : event.deltaMode === 2
        ? state.view.height
        : 1;
    const deltaX = event.deltaX * deltaUnit;
    const deltaY = event.deltaY * deltaUnit;

    if (event.ctrlKey || event.metaKey) {
      const zoomFactor = Math.exp(-deltaY * 0.002);
      setCameraZoom(
        state.camera.zoom * zoomFactor,
        pointerToCanvasPoint(event)
      );
      dom.gestureReadout.textContent =
        `CAMERA ZOOM · ${Math.round(state.camera.zoom * 100)}% · F resets view`;
    } else {
      const horizontal = event.shiftKey && Math.abs(deltaX) < Math.abs(deltaY)
        ? deltaY
        : deltaX;
      const vertical = event.shiftKey && Math.abs(deltaX) < Math.abs(deltaY)
        ? 0
        : deltaY;
      state.camera.panX = clamp(state.camera.panX - horizontal, -1600, 1600);
      state.camera.panY = clamp(state.camera.panY - vertical, -1200, 1200);
      applyCameraToView();
      dom.gestureReadout.textContent =
        `TOUCHPAD PAN · X ${Math.round(state.camera.panX)} · Y ${Math.round(state.camera.panY)}`;
    }
    scheduleCameraPreferenceSave();
    event.preventDefault();
  }

  function closestBoneAt(worldPoint) {
    let closest = null;
    let closestDistance = 34 / Math.max(state.view.scale, 0.3);
    bones.forEach((bone) => {
      const matrix = state.matrices.get(bone.id);
      if (!matrix) {
        return;
      }
      const point = pointThrough(matrix, 0, 0);
      const distance = Math.hypot(point.x - worldPoint.x, point.y - worldPoint.y);
      if (distance < closestDistance) {
        closest = bone;
        closestDistance = distance;
      }
    });
    if (closest) {
      return closest;
    }

    const ordered = bones.slice().sort((left, right) => right.layer - left.layer);
    return ordered.find((bone) => {
      const matrix = state.matrices.get(bone.id);
      const inverse = matrix ? matrixInvert(matrix) : null;
      if (!inverse) {
        return false;
      }
      const local = pointThrough(inverse, worldPoint.x, worldPoint.y);
      return local.x >= -bone.width * bone.pivotX &&
        local.x <= bone.width * (1 - bone.pivotX) &&
        local.y >= -bone.height * bone.pivotY &&
        local.y <= bone.height * (1 - bone.pivotY);
    }) || null;
  }

  function hitTestGizmo(worldPoint) {
    if (state.currentTool === "hand") {
      return null;
    }
    const geometry = gizmoGeometry();
    if (!geometry || state.isPlaying) {
      return null;
    }
    const scale = Math.max(state.view.scale, 0.001);
    const distancePixels = (point) => Math.hypot(
      worldPoint.x - point.x,
      worldPoint.y - point.y
    ) * scale;

    if (distancePixels(geometry.layerFront) <= 24) {
      return { action: "layer-front", targetId: geometry.targetId };
    }
    if (distancePixels(geometry.layerBack) <= 24) {
      return { action: "layer-back", targetId: geometry.targetId };
    }
    if (distancePixels(geometry.depthHandle) <= 24) {
      return { tool: "depth", targetId: geometry.targetId };
    }

    const railXDistance = Math.abs(worldPoint.x - geometry.depthTop.x) * scale;
    const railMinY = Math.min(geometry.depthTop.y, geometry.depthBottom.y);
    const railMaxY = Math.max(geometry.depthTop.y, geometry.depthBottom.y);
    if (
      railXDistance <= 18 &&
      worldPoint.y >= railMinY - 10 / scale &&
      worldPoint.y <= railMaxY + 10 / scale
    ) {
      return { tool: "depth", targetId: geometry.targetId };
    }

    const radiusPixels = Math.hypot(
      worldPoint.x - geometry.point.x,
      worldPoint.y - geometry.point.y
    ) * scale;
    const rotationRadiusPixels = geometry.rotationRadius * scale;
    if (
      distancePixels(geometry.rotateHandle) <= 24 ||
      Math.abs(radiusPixels - rotationRadiusPixels) <= 14
    ) {
      return { tool: "rotate", targetId: geometry.targetId };
    }
    if (distancePixels(geometry.tiltHandle) <= 24) {
      return { tool: "tilt", targetId: geometry.targetId };
    }
    if (distancePixels(geometry.moveHandle) <= 24) {
      return { tool: "move", targetId: geometry.targetId };
    }
    return null;
  }

  function beginCameraPan(event) {
    const canvasPoint = pointerToCanvasPoint(event);
    state.cameraPointers.set(event.pointerId, canvasPoint);
    state.cameraGesture = {
      kind: "pan",
      pointerIds: [event.pointerId],
      startPoint: canvasPoint,
      startPanX: state.camera.panX,
      startPanY: state.camera.panY
    };
    state.activePointers.clear();
    state.drag = null;
    dom.canvas.setPointerCapture(event.pointerId);
    dom.canvas.style.cursor = "grabbing";
    dom.gestureReadout.textContent = event.button === 1
      ? "CAMERA PAN · Middle mouse drag"
      : "HAND · Drag to pan the stage camera";
    event.preventDefault();
  }

  function handleCanvasPointerDown(event) {
    if (event.button === 1) {
      beginCameraPan(event);
      return;
    }
    if (
      event.button === 0 &&
      state.currentTool === "hand" &&
      state.cameraPointers.size === 0
    ) {
      beginCameraPan(event);
      return;
    }
    if (event.button !== 0 || state.isPlaying) {
      return;
    }
    const world = pointerToWorld(event);
    const canvasPoint = pointerToCanvasPoint(event);
    state.cameraPointers.set(event.pointerId, canvasPoint);
    dom.canvas.setPointerCapture(event.pointerId);

    if (state.cameraPointers.size === 2) {
      const pointerIds = [...state.cameraPointers.keys()];
      const first = state.cameraPointers.get(pointerIds[0]);
      const second = state.cameraPointers.get(pointerIds[1]);
      state.cameraGesture = {
        kind: "pinch",
        pointerIds,
        startCenter: {
          x: (first.x + second.x) / 2,
          y: (first.y + second.y) / 2
        },
        startDistance: Math.max(1, Math.hypot(second.x - first.x, second.y - first.y)),
        startZoom: state.camera.zoom,
        startPanX: state.camera.panX,
        startPanY: state.camera.panY
      };
      state.multiGesture = null;
      dom.gestureReadout.textContent = "CAMERA · Pinch zoom · move two fingers to pan";
      event.preventDefault();
      return;
    }

    const gizmoHit = hitTestGizmo(world);
    if (gizmoHit?.action) {
      state.cameraPointers.delete(event.pointerId);
      if (dom.canvas.hasPointerCapture(event.pointerId)) {
        dom.canvas.releasePointerCapture(event.pointerId);
      }
      if (gizmoHit.targetId !== state.selectedBoneId) {
        selectBone(gizmoHit.targetId);
      }
      nudgeLayer(gizmoHit.action === "layer-front" ? 20 : -20);
      dom.gestureReadout.textContent = gizmoHit.action === "layer-front"
        ? "LAYER FRONT + · selected part moved one layer forward"
        : "LAYER BACK − · selected part moved one layer backward";
      event.preventDefault();
      return;
    }
    if (gizmoHit?.tool) {
      activateToolUI(gizmoHit.tool);
    }

    state.activePointers.set(event.pointerId, world);

    const bone = gizmoHit?.targetId
      ? boneById.get(gizmoHit.targetId)
      : state.currentTool === "whole" || state.currentTool === "path"
        ? boneById.get(state.character.rootId)
        : closestBoneAt(world);
    if (!bone) {
      state.activePointers.delete(event.pointerId);
      state.cameraPointers.delete(event.pointerId);
      if (dom.canvas.hasPointerCapture(event.pointerId)) {
        dom.canvas.releasePointerCapture(event.pointerId);
      }
      return;
    }
    selectBone(bone.id);
    const startPose = poseForBone(bone.id, state.currentTime, true);
    const parentMatrix = bone.parent ? state.matrices.get(bone.parent) : null;
    const parentInverse = parentMatrix ? matrixInvert(parentMatrix) : null;
    const startLocal = parentInverse
      ? pointThrough(parentInverse, world.x, world.y)
      : world;
    const boneMatrix = state.matrices.get(bone.id);
    const jointWorld = boneMatrix
      ? pointThrough(boneMatrix, 0, 0)
      : { x: bone.x + startPose.tx, y: bone.y + startPose.ty };
    state.drag = {
      pointerId: event.pointerId,
      boneId: bone.id,
      startPose,
      startWorld: world,
      startLocal,
      jointWorld,
      startPointerAngle: Math.atan2(world.y - jointWorld.y, world.x - jointWorld.x),
      tool: state.currentTool,
      snapshot: dom.autoKeyToggle.checked ? projectSnapshot() : null,
      moved: false
    };
    event.preventDefault();
  }

  function applyGestureValues(boneId, rawValues) {
    let values = transform(rawValues);
    if (state.currentTool === "path" && state.autoOrientPath) {
      values = orientValuesToPath(values, state.currentTime);
    }
    if (dom.autoKeyToggle.checked) {
      upsertKey(boneId, state.currentTime, values);
    } else {
      state.previewOverrides[boneId] = values;
    }
    updateInspector();
    state.dirty = true;
    return values;
  }

  function handleCanvasPointerMove(event) {
    if (state.cameraPointers.has(event.pointerId)) {
      state.cameraPointers.set(event.pointerId, pointerToCanvasPoint(event));
    }
    if (state.cameraGesture) {
      const first = state.cameraPointers.get(state.cameraGesture.pointerIds[0]);
      if (!first) {
        return;
      }
      if (state.cameraGesture.kind === "pan") {
        state.camera.panX = clamp(
          state.cameraGesture.startPanX + first.x - state.cameraGesture.startPoint.x,
          -1600,
          1600
        );
        state.camera.panY = clamp(
          state.cameraGesture.startPanY + first.y - state.cameraGesture.startPoint.y,
          -1200,
          1200
        );
        applyCameraToView();
        dom.canvas.style.cursor = "grabbing";
        dom.gestureReadout.textContent =
          `CAMERA PAN · X ${Math.round(state.camera.panX)} · Y ${Math.round(state.camera.panY)}`;
        event.preventDefault();
        return;
      }
      const second = state.cameraPointers.get(state.cameraGesture.pointerIds[1]);
      if (!second) {
        return;
      }
      const center = {
        x: (first.x + second.x) / 2,
        y: (first.y + second.y) / 2
      };
      const distance = Math.max(1, Math.hypot(second.x - first.x, second.y - first.y));
      const zoom = clamp(
        state.cameraGesture.startZoom * distance / state.cameraGesture.startDistance,
        0.6,
        4
      );
      const fit = fitCenter();
      const baseVectorX =
        (state.cameraGesture.startCenter.x - fit.x - state.cameraGesture.startPanX) /
        state.cameraGesture.startZoom;
      const baseVectorY =
        (state.cameraGesture.startCenter.y - fit.y - state.cameraGesture.startPanY) /
        state.cameraGesture.startZoom;
      state.camera.zoom = zoom;
      state.camera.panX = clamp(center.x - fit.x - zoom * baseVectorX, -1600, 1600);
      state.camera.panY = clamp(center.y - fit.y - zoom * baseVectorY, -1200, 1200);
      applyCameraToView();
      dom.canvas.style.cursor = "grabbing";
      dom.gestureReadout.textContent =
        `CAMERA · ${Math.round(zoom * 100)}% · two-finger pan`;
      event.preventDefault();
      return;
    }

    if (!state.activePointers.has(event.pointerId)) {
      if (state.currentTool === "hand") {
        dom.canvas.style.cursor = "grab";
        return;
      }
      const hover = hitTestGizmo(pointerToWorld(event));
      if (hover?.action) {
        dom.canvas.style.cursor = "pointer";
      } else if (hover?.tool === "rotate") {
        dom.canvas.style.cursor = "alias";
      } else if (hover?.tool === "depth") {
        dom.canvas.style.cursor = "ns-resize";
      } else if (hover?.tool === "tilt") {
        dom.canvas.style.cursor = "ew-resize";
      } else if (hover?.tool === "move") {
        dom.canvas.style.cursor = "grab";
      } else {
        dom.canvas.style.cursor = "crosshair";
      }
      return;
    }
    dom.canvas.style.cursor = "grabbing";
    const world = pointerToWorld(event);
    state.activePointers.set(event.pointerId, world);

    if (!state.drag || state.drag.pointerId !== event.pointerId) {
      return;
    }
    const bone = boneById.get(state.drag.boneId);
    const start = state.drag.startPose;
    const gestureTool = state.drag.tool;
    let values = { ...start };

    if (gestureTool === "move" || gestureTool === "whole" || gestureTool === "path") {
      const parentMatrix = bone.parent ? state.matrices.get(bone.parent) : null;
      const parentInverse = parentMatrix ? matrixInvert(parentMatrix) : null;
      const localPoint = parentInverse
        ? pointThrough(parentInverse, world.x, world.y)
        : world;
      values.tx = clamp(start.tx + localPoint.x - state.drag.startLocal.x, -140, 140);
      values.ty = clamp(start.ty + localPoint.y - state.drag.startLocal.y, -140, 140);
    } else if (gestureTool === "rotate") {
      const pointerAngle = Math.atan2(
        world.y - state.drag.jointWorld.y,
        world.x - state.drag.jointWorld.x
      );
      const delta = shortestAngleDelta(
        state.drag.startPointerAngle * 180 / Math.PI,
        pointerAngle * 180 / Math.PI
      );
      values.rz = clamp(start.rz + delta, -180, 180);
    } else if (gestureTool === "tilt") {
      const deltaX = world.x - state.drag.startWorld.x;
      const deltaY = world.y - state.drag.startWorld.y;
      values.ry = clamp(start.ry + deltaX * 0.7, -65, 65);
      values.scale = clamp(start.scale - deltaY * 0.005, 0.55, 1.45);
    } else if (gestureTool === "depth") {
      const deltaY = state.drag.startWorld.y - world.y;
      values.z = clamp(start.z + deltaY * 1.6, -160, 160);
    }

    state.drag.moved = true;
    const applied = applyGestureValues(bone.id, values);
    if (gestureTool === "rotate") {
      dom.gestureReadout.textContent = `ROTATE · ${bone.shortName} · ${displayValue("rz", applied.rz)}`;
    } else if (gestureTool === "tilt") {
      dom.gestureReadout.textContent =
        `2.5D TILT · Y ${displayValue("ry", applied.ry)} · S ${displayValue("scale", applied.scale)}`;
    } else if (gestureTool === "depth") {
      dom.gestureReadout.textContent = `DEPTH · ${bone.shortName} · Z ${Math.round(applied.z)}`;
    } else if (gestureTool === "path") {
      dom.gestureReadout.textContent =
        `PATH · X ${Math.round(applied.tx)} · Y ${Math.round(applied.ty)} · R ${displayValue("rz", applied.rz)}`;
    } else {
      dom.gestureReadout.textContent =
        `${gestureTool === "whole" ? "WHOLE RIG" : "MOVE"} · X ${Math.round(applied.tx)} · Y ${Math.round(applied.ty)}`;
    }
    event.preventDefault();
  }

  function handleCanvasPointerUp(event) {
    const finishingCameraGesture = Boolean(state.cameraGesture);
    const cameraGestureKind = state.cameraGesture?.kind;
    state.cameraPointers.delete(event.pointerId);
    if (finishingCameraGesture) {
      if (state.drag?.moved && dom.autoKeyToggle.checked) {
        applyAiAssist(state.drag.boneId, state.drag.startPose);
        checkpoint(state.drag.snapshot);
        projectChanged();
      }
      [...state.cameraPointers.keys()].forEach((pointerId) => {
        if (dom.canvas.hasPointerCapture(pointerId)) {
          dom.canvas.releasePointerCapture(pointerId);
        }
      });
      state.cameraPointers.clear();
      state.activePointers.clear();
      state.cameraGesture = null;
      state.multiGesture = null;
      state.drag = null;
      if (dom.canvas.hasPointerCapture(event.pointerId)) {
        dom.canvas.releasePointerCapture(event.pointerId);
      }
      saveCameraPreference();
      dom.canvas.style.cursor = state.currentTool === "hand" ? "grab" : "crosshair";
      dom.gestureReadout.textContent = cameraGestureKind === "pan"
        ? `CAMERA PAN · ${Math.round(state.camera.zoom * 100)}% · drag again or tap Fit`
        : `CAMERA · ${Math.round(state.camera.zoom * 100)}% · pinch again or tap Fit`;
      return;
    }

    if (!state.activePointers.has(event.pointerId) && !state.drag) {
      return;
    }
    state.activePointers.delete(event.pointerId);
    if (state.drag?.moved && dom.autoKeyToggle.checked) {
      applyAiAssist(state.drag.boneId, state.drag.startPose);
      checkpoint(state.drag.snapshot);
      projectChanged();
    }
    [...state.activePointers.keys()].forEach((pointerId) => {
      if (dom.canvas.hasPointerCapture(pointerId)) {
        dom.canvas.releasePointerCapture(pointerId);
      }
    });
    state.activePointers.clear();
    state.multiGesture = null;
    state.drag = null;
    if (dom.canvas.hasPointerCapture(event.pointerId)) {
      dom.canvas.releasePointerCapture(event.pointerId);
    }
    if (!dom.autoKeyToggle.checked) {
      dom.gestureReadout.textContent = `${toolInstruction()} · Press Add / Update Key to save`;
    }
    dom.canvas.style.cursor = state.currentTool === "hand" ? "grab" : "crosshair";
  }

  function bindPropertyControls() {
    dom.propertyInputs.forEach((input) => {
      input.addEventListener("pointerdown", () => {
        state.sliderSnapshot = dom.autoKeyToggle.checked ? projectSnapshot() : null;
        state.sliderBaseline = poseForBone(state.selectedBoneId, state.currentTime, true);
        pause();
      });
      input.addEventListener("input", () => {
        const prop = input.dataset.prop;
        const current = poseForBone(state.selectedBoneId, state.currentTime, true);
        const values = transform({
          ...current,
          [prop]: Number(input.value)
        });
        if (dom.autoKeyToggle.checked) {
          upsertKey(state.selectedBoneId, state.currentTime, values);
        } else {
          state.previewOverrides[state.selectedBoneId] = values;
        }
        updateInspector();
        state.dirty = true;
      });
      input.addEventListener("change", () => {
        if (dom.autoKeyToggle.checked && state.sliderSnapshot) {
          applyAiAssist(state.selectedBoneId, state.sliderBaseline);
          checkpoint(state.sliderSnapshot);
          projectChanged();
        }
        state.sliderSnapshot = null;
        state.sliderBaseline = null;
      });
    });
  }

  function bindInterface() {
    dom.playButton.addEventListener("click", play);
    dom.stopButton.addEventListener("click", stop);
    dom.undoButton.addEventListener("click", undo);
    dom.redoButton.addEventListener("click", redo);
    dom.addKeyButton.addEventListener("click", addOrUpdateKey);
    dom.deleteKeyButton.addEventListener("click", deleteCurrentKey);
    dom.resetTransformButton.addEventListener("click", resetCurrentTransform);
    dom.previousKeyButton.addEventListener("click", () => jumpToKey(-1));
    dom.nextKeyButton.addEventListener("click", () => jumpToKey(1));
    dom.layerDownButton.addEventListener("click", () => nudgeLayer(-20));
    dom.layerUpButton.addEventListener("click", () => nudgeLayer(20));
    dom.orientPathButton.addEventListener("click", orientCurrentKeyToPath);
    dom.zoomOutButton.addEventListener("click", () => {
      setCameraZoom(state.camera.zoom / 1.25);
      saveCameraPreference();
      dom.gestureReadout.textContent = `CAMERA · ${Math.round(state.camera.zoom * 100)}%`;
    });
    dom.zoomInButton.addEventListener("click", () => {
      setCameraZoom(state.camera.zoom * 1.25);
      saveCameraPreference();
      dom.gestureReadout.textContent = `CAMERA · ${Math.round(state.camera.zoom * 100)}%`;
    });
    dom.fitCameraButton.addEventListener("click", resetCamera);
    dom.mobileAddKeyButton.addEventListener("click", addOrUpdateKey);
    dom.mobileScrollButtons.forEach((button) => {
      button.addEventListener("click", () => {
        dom.mobileScrollButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        document.getElementById(button.dataset.scrollTarget)?.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    });
    dom.controlHelpButton.addEventListener("click", () => {
      setControlCoach(!state.showControlCoach);
    });
    dom.closeControlCoach.addEventListener("click", () => {
      setControlCoach(false);
    });
    dom.rigToolButtons.forEach((button) => {
      button.addEventListener("click", () => setTool(button.dataset.tool));
    });
    dom.autoOrientPathToggle.addEventListener("change", () => {
      state.autoOrientPath = dom.autoOrientPathToggle.checked;
      dom.gestureReadout.textContent = state.autoOrientPath
        ? "PATH · Auto orientation enabled"
        : "PATH · Auto orientation disabled";
      scheduleAutosave();
      state.dirty = true;
    });
    dom.pathAngleOffset.addEventListener("input", () => {
      state.pathAngleOffset = Number(dom.pathAngleOffset.value);
      dom.pathAngleOffsetOutput.textContent = displayValue("rz", state.pathAngleOffset);
      updateRangeFill(dom.pathAngleOffset);
      state.dirty = true;
    });
    dom.pathAngleOffset.addEventListener("change", scheduleAutosave);

    dom.skeletonToggle.addEventListener("click", () => {
      state.showSkeleton = !state.showSkeleton;
      dom.skeletonToggle.classList.toggle("active", state.showSkeleton);
      dom.skeletonToggle.setAttribute("aria-pressed", String(state.showSkeleton));
      state.dirty = true;
    });
    dom.onionToggle.addEventListener("click", () => {
      state.showOnion = !state.showOnion;
      dom.onionToggle.classList.toggle("active", state.showOnion);
      dom.onionToggle.setAttribute("aria-pressed", String(state.showOnion));
      state.dirty = true;
    });
    dom.aiAssistToggle.addEventListener("click", () => {
      state.aiAssist = !state.aiAssist;
      updateAiAssistUI();
      dom.gestureReadout.textContent = state.aiAssist
        ? "✨ AI ASSIST ON · moving a bone now eases the neighbouring keyframes for you"
        : "AI ASSIST OFF · edits only touch the current keyframe";
      scheduleAutosave();
    });
    dom.gridToggle.addEventListener("click", () => {
      const active = dom.stageShell.classList.toggle("show-grid");
      dom.gridToggle.classList.toggle("active", active);
      dom.gridToggle.setAttribute("aria-pressed", String(active));
    });

    dom.timelineScrubber.addEventListener("input", () => {
      seek(Number(dom.timelineScrubber.value));
    });
    dom.durationInput.addEventListener("change", changeDuration);
    dom.snapSelect.addEventListener("change", () => {
      state.snapFps = Number(dom.snapSelect.value);
      state.currentTime = snapTime(state.currentTime);
      scheduleAutosave();
      updateTimeUI();
      state.dirty = true;
    });

    dom.exportButton.addEventListener("click", exportCharacter);
    dom.importButton.addEventListener("click", () => dom.importInput.click());
    dom.importInput.addEventListener("change", () => importCharacter(dom.importInput.files?.[0]));

    dom.newClipButton.addEventListener("click", createClip);
    dom.duplicateClipButton.addEventListener("click", duplicateActiveClip);
    dom.renameClipButton.addEventListener("click", renameActiveClip);
    dom.deleteClipButton.addEventListener("click", deleteActiveClip);

    if (dom.characterSelect) {
      dom.characterSelect.addEventListener("change", () => switchCharacter(dom.characterSelect.value));
      dom.newCharacterButton.addEventListener("click", duplicateCharacter);
      dom.renameCharacterButton.addEventListener("click", renameCharacter);
      dom.deleteCharacterButton.addEventListener("click", deleteCharacter);
      dom.sceneSelect.addEventListener("change", () => selectScene(dom.sceneSelect.value));
      dom.addSceneButton.addEventListener("click", () => dom.sceneImageInput.click());
      dom.sceneImageInput.addEventListener("change", () => addSceneImage(dom.sceneImageInput.files?.[0]));
      dom.deleteSceneButton.addEventListener("click", deleteScene);
      dom.sceneColorInput.addEventListener("input", () => useSolidSceneColor(dom.sceneColorInput.value));
      dom.useSolidColorButton.addEventListener("click", () => useSolidSceneColor(dom.sceneColorInput.value));
      dom.keyframeSetSelect.addEventListener("change", () => selectKeyframeSet(dom.keyframeSetSelect.value));
      dom.applyKeyframeSetButton.addEventListener("click", applySelectedKeyframeSet);
      dom.saveKeyframeSetButton.addEventListener("click", saveActiveClipAsKeyframeSet);
      dom.exportKeyframeSetButton.addEventListener("click", exportKeyframeSet);
      dom.importKeyframeSetButton.addEventListener("click", () => dom.keyframeSetInput.click());
      dom.keyframeSetInput.addEventListener("change", () => importKeyframeSet(dom.keyframeSetInput.files?.[0]));
      dom.deleteKeyframeSetButton.addEventListener("click", deleteKeyframeSet);
    }

    dom.canvas.addEventListener("pointerdown", handleCanvasPointerDown);
    dom.canvas.addEventListener("pointermove", handleCanvasPointerMove);
    dom.canvas.addEventListener("pointerup", handleCanvasPointerUp);
    dom.canvas.addEventListener("pointercancel", handleCanvasPointerUp);
    dom.canvas.addEventListener("wheel", handleCanvasWheel, { passive: false });
    dom.canvas.addEventListener("auxclick", (event) => {
      if (event.button === 1) {
        event.preventDefault();
      }
    });
    document.addEventListener("keydown", handleKeyboard);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        pause();
      }
    });
    window.addEventListener("resize", () => {
      resizeCanvas();
      updatePlayhead();
    });

    bindPropertyControls();
  }

  function initialize() {
    loadAutosave();
    loadCameraPreference();
    syncProjectControls();
    renderLibraryBar();
    applyScene(state.sceneId);
    renderClipBar();
    renderHierarchy();
    renderTimeline();
    updateInspector();
    updateTimeUI();
    updateUndoButtons();
    bindInterface();
    resizeCanvas();
    loadCharacterImages();
    state.rafId = requestAnimationFrame(animationLoop);
  }

  initialize();
})();
