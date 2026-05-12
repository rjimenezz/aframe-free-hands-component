AFRAME.registerComponent('manos-esferas', {
  schema: {
    // Radio por defecto si el dispositivo no da radio de la articulación
    radius: { type: 'number', default: 0.006 },
    // Usar el radio estimado del XRHand (si está disponible)
    useJointRadius: { type: 'boolean', default: true },
    radiusScale: { type: 'number', default: 1.0 },
    minRadius: { type: 'number', default: 0.004 },
    maxRadius: { type: 'number', default: 0.012 },
    // Colores por mano
    colorLeft: { type: 'string', default: '#39f' },
    colorRight: { type: 'string', default: '#f93' },
    opacity: { type: 'number', default: 0.85 },
    // Etiquetas opcionales con el nombre de la articulación
    labels: { type: 'boolean', default: false },
    labelScale: { type: 'number', default: 0.2 },
    // Gestos integrados (opcionales)
    enablePinch: { type: 'boolean', default: false },
    enablePoint: { type: 'boolean', default: false },
    gestureHand: { type: 'string', default: 'any' },
    gestureEmitEachFrame: { type: 'boolean', default: true },
    gestureColliderType: { type: 'string', default: 'obb-collider', oneOf: ['obb-collider', 'sat-collider'] }
  },

  init: function () {
    this.renderer = null;
    this.referenceSpace = null;
    // key: "left:wrist", "right:index-finger-tip" -> { sphere, label? }
    this.jointEntities = {};
    this._touched = new Set();
    this._autoGestures = { pinch: false, point: false };
    this._ensureGestures();
  },

  _ensureGestures: function () {
    if (this.data.enablePinch && !this.el.components['gesto-pellizco']) {
      this.el.setAttribute('gesto-pellizco', {
        hand: this.data.gestureHand,
        emitEachFrame: this.data.gestureEmitEachFrame,
        colliderType: this.data.gestureColliderType
      });
      this._autoGestures.pinch = true;
    }

    if (this.data.enablePoint && !this.el.components['gesto-apuntar']) {
      this.el.setAttribute('gesto-apuntar', {
        hand: this.data.gestureHand,
        emitEachFrame: this.data.gestureEmitEachFrame,
        colliderType: this.data.gestureColliderType
      });
      this._autoGestures.point = true;
    }
  },
  tick: function () {
    const scene = this.el.sceneEl;
    if (!scene || !scene.renderer) return;

    if (!this.renderer) this.renderer = scene.renderer;
    const session = this.renderer.xr.getSession();
    if (!session) return;

    const frame = scene.frame;
    if (!frame) return;

    if (!this.referenceSpace) {
      this.referenceSpace = this.renderer.xr.getReferenceSpace();
      if (!this.referenceSpace) return;
    }

    // Marcar nada como actualizado al inicio del frame
    this._touched.clear();

    for (const inputSource of session.inputSources) {
      if (!inputSource.hand) continue;

      const handedness = inputSource.handedness === 'left' ? 'left' : 'right';
      const color = handedness === 'left' ? this.data.colorLeft : this.data.colorRight;

      // Recorre todas las articulaciones disponibles del XRHand
      for (const jointName of inputSource.hand.keys()) {
        const joint = inputSource.hand.get(jointName);
        const pose = frame.getJointPose(joint, this.referenceSpace);
        const key = handedness + ':' + jointName;

        // Crear esfera (y etiqueta) la primera vez
        let entry = this.jointEntities[key];
        if (!entry) {
          const s = document.createElement('a-sphere');
          s.setAttribute('color', color);
          s.setAttribute('opacity', this.data.opacity);
          s.setAttribute('transparent', true);
          // Menos segmentos para rendimiento
          s.setAttribute('segments-width', 8);
          s.setAttribute('segments-height', 6);
          // Añadir directamente a la escena para estar en coordenadas mundiales
          this.el.sceneEl.appendChild(s);

          let label = null;
          if (this.data.labels) {
            label = document.createElement('a-entity');
            label.setAttribute('text', {
              value: jointName.replace(/-/g, ' '),
              align: 'center',
              color: color,
              width: 1.5
            });
            s.appendChild(label);
            label.object3D.position.set(0, this.data.radius * 2, 0);
            label.object3D.scale.set(this.data.labelScale, this.data.labelScale, this.data.labelScale);
          }

          entry = { sphere: s, label };
          this.jointEntities[key] = entry;
        }

        if (!pose) {
          // Si no hay pose este frame, ocultamos
          entry.sphere.object3D.visible = false;
          continue;
        }

        // Posicionar esfera
        const p = pose.transform.position;
        entry.sphere.object3D.position.set(p.x, p.y, p.z);

        // Ajustar radio
        let r = this.data.radius;
        if (this.data.useJointRadius && pose.radius) {
          r = Math.min(this.data.maxRadius, Math.max(this.data.minRadius, pose.radius * this.data.radiusScale));
        }
        entry.sphere.setAttribute('radius', r);

        // Asegurar visible al actualizar
        entry.sphere.object3D.visible = true;

        // Marcar como actualizada
        this._touched.add(key);
      }
    }

    // Ocultar articulaciones no actualizadas este frame
    for (const [key, entry] of Object.entries(this.jointEntities)) {
      if (!this._touched.has(key)) {
        entry.sphere.object3D.visible = false;
      }
    }
  },

  remove: function () {
    if (this._autoGestures?.pinch) this.el.removeAttribute('gesto-pellizco');
    if (this._autoGestures?.point) this.el.removeAttribute('gesto-apuntar');
    // Limpiar esferas al quitar el componente
    for (const entry of Object.values(this.jointEntities)) {
      entry.sphere.remove();
    }
    this.jointEntities = {};
  }
});