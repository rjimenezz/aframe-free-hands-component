# A-Frame Free Hands Component

An all-in-one hand-tracking interaction library for [A-Frame](https://aframe.io). 

Inspired by the popular [aframe-super-hands-component](https://github.com/c-frame/aframe-super-hands-component), this toolkit brings the same semantic modularity and ease of use to **controller-free WebXR hand tracking**. It allows you to grab, stretch, drag, drop, and click 3D objects using natural bare-hand gestures (like pinching and pointing) without relying on hardware controllers.

## Features

* **Drop-in replacement**: Seamlessly replaces traditional `super-hands` reaction components (`grabbable`, `hoverable`, etc.) without changing your existing entity structure.
* **Optical Hand Tracking**: Built entirely on top of the WebXR Hand Tracking API. No controllers needed.
* **Dual Collision Engines**: Supports both A-Frame's native `obb-collider` and a custom-built, highly accurate `sat-collider`.
* **All-in-one injection**: A single `hands-spheres` component handles both the visual representation of the joints and the automatic injection of gesture detectors.

## Installation

### Browser

Include the A-Frame script and the `free-hands.min.js` script in your `<head>`. 
*(Note: Always delete A-Frame's native `grabbable` component before loading this library to prevent naming conflicts).*

```html
<head>
  <script src="https://aframe.io/releases/1.6.0/aframe.min.js"></script>
  <script>
    // Prevent conflicts with native A-Frame components
    delete AFRAME.components["grabbable"];
  </script>
  <script src="https://cdn.jsdelivr.net/gh/rjimenezz/aframe-free-hands-component@v1.0.5/dist/free-hands.min.js"></script>
</head>
```

## Getting Started

Building an interactive scene is purely declarative. You must enable `hand-tracking` in the `<a-scene>` tag, add the `hands-spheres` entity to manage gestures, and attach the interactable attributes to your 3D objects.

```html
<body>
  <a-scene xr-mode-ui="enabled: true" webxr="optionalFeatures: hand-tracking">
    
    <a-entity camera position="0 1.6 0"></a-entity>

    <a-entity hands-spheres="enablePinch: true; enablePoint: true; gestureColliderType: obb-collider">
    </a-entity>

    <a-box color="blue" position="0 1 -1"
           hoverable 
           grabbable 
           stretchable 
           draggable 
           droppable>
    </a-box>

  </a-scene>
</body>
```

## API Reference

The toolkit is divided into two main families: **Gestures** (Core/Detectors) and **Interactables** (Reaction components).

### Gesture Components (Core)

These components are attached to the hands and act as the sensory core of the system.

#### `hands-spheres`
The central manager. It renders the 25 anatomical joints of the WebXR hand and automatically injects the required gesture detectors into the scene.
* **`radius`** *(number, default: 0.006)*: Default joint radius if device estimation is unavailable.
* **`useJointRadius`** *(boolean, default: true)*: Use the dynamic radius estimated by the XR headset.
* **`radiusScale`** *(number, default: 1.0)*: Multiplier for the joint radius.
* **`minRadius`** *(number, default: 0.004)*: Minimum allowed joint radius.
* **`maxRadius`** *(number, default: 0.012)*: Maximum allowed joint radius.
* **`colorLeft`** *(string, default: '#39f')*: Base color for the left hand spheres.
* **`colorRight`** *(string, default: '#f93')*: Base color for the right hand spheres.
* **`opacity`** *(number, default: 0.85)*: Transparency level of the joints.
* **`labels`** *(boolean, default: false)*: Show floating text labels with joint names.
* **`labelScale`** *(number, default: 0.2)*: Scale of the text labels.
* **`enablePinch`** *(boolean, default: false)*: Automatically injects the `pinch-gesture` component.
* **`enablePoint`** *(boolean, default: false)*: Automatically injects the `point-gesture` component.
* **`gestureHand`** *(string, default: 'any')*: Defines which hand to track ('left', 'right', or 'any').
* **`gestureEmitEachFrame`** *(boolean, default: true)*: Sets continuous event emission for injected gestures.
* **`gestureColliderType`** *(string, default: 'obb-collider')*: Type of collider to use ('obb-collider' or 'sat-collider').

#### `pinch-gesture`
Analyzes the Euclidean distance between the index finger tip and the thumb tip.
* **`hand`** *(string, default: 'any')*: Hand to track ('left', 'right', 'any').
* **`startDistance`** *(number, default: 0.025)*: Distance (in meters) to trigger a pinch start.
* **`endDistance`** *(number, default: 0.035)*: Distance (in meters) to trigger a pinch end.
* **`emitEachFrame`** *(boolean, default: true)*: Emit `pinchmove` events continuously while pinching.
* **`log`** *(boolean, default: false)*: Enable console debugging logs.
* **`debugCollider`** *(boolean, default: false)*: Render a wireframe of the hand's collision box.
* **`colliderType`** *(string, default: 'sat-collider')*: Collision math to use ('sat-collider' or 'obb-collider').
* **`colliderSize`** *(vec3, default: 0.12 0.08 0.18)*: Dimensions of the hand's bounding box.

#### `point-gesture`
Evaluates the hand posture to confirm the index finger is fully extended while other fingers are closed.
* **`hand`** *(string, default: 'any')*: Hand to track ('left', 'right', 'any').
* **`indexExtendedThreshold`** *(number, default: 0.06)*: Minimum extension distance for the index finger.
* **`otherFingersThreshold`** *(number, default: 0.08)*: Maximum allowed extension for closed fingers.
* **`pinchCancelThreshold`** *(number, default: 0.04)*: Distance threshold to cancel pointing if a pinch is detected.
* **`emitEachFrame`** *(boolean, default: true)*: Continuously emit the pointing direction vector.
* **`log`** *(boolean, default: false)*: Enable console debugging logs.
* **`debugCollider`** *(boolean, default: false)*: Render a wireframe of the fingertip's collision box.
* **`colliderType`** *(string, default: 'sat-collider')*: Collision math to use ('sat-collider' or 'obb-collider').
* **`colliderSize`** *(vec3, default: 0.02 0.02 0.02)*: Dimensions of the index fingertip's bounding box.

---

### Interactable Components (Reactions)

These components are attached to the objects in the scene. They listen to the events emitted by the gestures and apply physical or semantic transformations.

#### `hoverable`
Provides visual feedback when a hand is within physical range.
* **`colliderSize`** *(vec3, default: 0.3 0.3 0.3)*: Size of the injected collider if the entity has none.
* **`emitEachFrame`** *(boolean, default: false)*: Continuously emit hovering events.
* **`debug`** *(boolean, default: false)*: Show collider wireframe.

#### `grabbable`
Allows an entity to be picked up and moved using a pinch gesture.
* **`maxGrabbers`** *(number, default: NaN)*: Maximum number of hands that can grab this simultaneously.
* **`invert`** *(boolean, default: false)*: Move the object in the opposite direction of the hand.
* **`suppressY`** *(boolean, default: false)*: Lock movement on the vertical (Y) axis.
* **`startGesture`** *(string, default: 'pinchstart')*: Event name to initiate the grab.
* **`endGesture`** *(string, default: 'pinchend')*: Event name to release the grab.

#### `stretchable`
Modifies the scale of an object when grabbed with both hands simultaneously.
* **`minScale`** *(number, default: 0.1)*: Minimum allowed scale factor.
* **`maxScale`** *(number, default: 10.0)*: Maximum allowed scale factor.
* **`invert`** *(boolean, default: false)*: Shrink when pulling apart, grow when pushing together.

#### `draggable`
Acts as the origin in a drag-and-drop cycle. Does not move the mesh visually.
* **`startGesture`** *(string, default: 'pinchstart')*: Event name to initiate dragging.
* **`endGesture`** *(string, default: 'pinchend')*: Event name to finish dragging.
* **`debug`** *(boolean, default: false)*: Show collider wireframe.

#### `droppable`
Acts as a target zone that filters and accepts `draggable` entities.
* **`accepts`** *(string, default: '')*: CSS selector to filter which objects can be dropped here (e.g., `.cube`).
* **`autoUpdate`** *(boolean, default: true)*: Observe DOM changes to update the list of acceptable targets dynamically.
* **`acceptEvent`** *(string, default: '')*: Custom event fired upon a successful drop.
* **`rejectEvent`** *(string, default: '')*: Custom event fired upon an invalid drop.
* **`debug`** *(boolean, default: false)*: Show collider wireframe.

#### `clickable`
Converts an entity into a physical button reacting to the index finger.
* **`startGesture`** *(string, default: 'pointstart')*: Event name to register a click down.
* **`endGesture`** *(string, default: 'pointend')*: Event name to register a click up.
* **`maxClickers`** *(number, default: NaN)*: Maximum hands that can click simultaneously.
* **`colliderSize`** *(vec3, default: 0.3 0.3 0.3)*: Size of the injected collider if the entity has none.
* **`debug`** *(boolean, default: false)*: Show collider wireframe.

## Examples

The repository includes a variety of examples demonstrating the capabilities of the toolkit.

1. Clone the repository: `git clone https://github.com/your-username/aframe-free-hands-component.git`
2. Install dependencies: `npm install`
3. Start the local development server: `npm start` (or use any local HTTP server like VSCode Live Server).
4. Navigate to `/examples` in your browser.

*Note: You must use a WebXR-compatible headset (like Meta Quest) to test the hand-tracking features.*

## Credits & Acknowledgements

* Architecture and component semantics heavily inspired by [aframe-super-hands-component](https://github.com/c-frame/aframe-super-hands-component) by William Murphy and the A-Frame community.
* Built on top of [A-Frame](https://aframe.io/) and [Three.js](https://threejs.org/).

## License

This project is open-source and distributed under the MIT License.
