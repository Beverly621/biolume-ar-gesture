import * as THREE from 'three';

const JOINTS = Object.freeze({
  wrist: 'wrist',
  thumbTip: 'thumb-tip',
  indexTip: 'index-finger-tip',
  middleTip: 'middle-finger-tip',
  ringTip: 'ring-finger-tip',
  pinkyTip: 'pinky-finger-tip',
  indexMetacarpal: 'index-finger-metacarpal',
  pinkyMetacarpal: 'pinky-finger-metacarpal'
});

export async function requestCameraPermission() {
  const stream = await requestCameraStream();

  // WebXR AR session 会接管真实相机流；这里仅做浏览器权限预检，避免保留后台摄像头占用。
  stream.getTracks().forEach((track) => track.stop());
  return true;
}

export async function requestCameraStream() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('当前浏览器不支持摄像头授权 API。');
  }

  return navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: { ideal: 'user' },
      width: { ideal: 1280 },
      height: { ideal: 720 }
    },
    audio: false
  });
}

export class XRHandGestureController {
  constructor({ renderer, skills, status }) {
    this.renderer = renderer;
    this.skills = skills;
    this.status = status;
    this.hands = new Map();
    this.tmpVec3 = new THREE.Vector3();
    this.lastPalmBloomAt = -Infinity;
    this.lastFingerTapAt = -Infinity;
    this.lastStretchAt = -Infinity;
    this.palmWasOpen = false;
    this.tapWasPinched = false;
  }

  update(time, frame) {
    if (!frame || !this.renderer.xr.isPresenting) return;

    const referenceSpace = this.renderer.xr.getReferenceSpace();
    const session = this.renderer.xr.getSession();
    if (!referenceSpace || !session) return;

    this.hands.clear();

    for (const inputSource of session.inputSources) {
      if (!inputSource.hand || !inputSource.handedness) continue;
      const hand = this.readHand(inputSource, frame, referenceSpace);
      if (hand) this.hands.set(inputSource.handedness, hand);
    }

    const left = this.hands.get('left');
    const right = this.hands.get('right');
    const activeHand = right ?? left;

    if (activeHand) {
      this.handlePalmOpen(activeHand, time);
      this.handleFingerTap(activeHand, time);
    }

    if (left && right) {
      this.handleTwoHandStretch(left, right, time);
    }
  }

  readHand(inputSource, frame, referenceSpace) {
    const joint = (name) => {
      const jointSpace = inputSource.hand.get(name);
      if (!jointSpace) return null;
      const pose = frame.getJointPose(jointSpace, referenceSpace);
      if (!pose) return null;
      return new THREE.Vector3(
        pose.transform.position.x,
        pose.transform.position.y,
        pose.transform.position.z
      );
    };

    const wrist = joint(JOINTS.wrist);
    const indexTip = joint(JOINTS.indexTip);
    const thumbTip = joint(JOINTS.thumbTip);
    const middleTip = joint(JOINTS.middleTip);
    const ringTip = joint(JOINTS.ringTip);
    const pinkyTip = joint(JOINTS.pinkyTip);
    const indexMetacarpal = joint(JOINTS.indexMetacarpal);
    const pinkyMetacarpal = joint(JOINTS.pinkyMetacarpal);

    if (!wrist || !indexTip || !thumbTip) return null;

    const palmPosition = new THREE.Vector3().copy(wrist);
    let palmSamples = 1;

    if (indexMetacarpal) {
      palmPosition.add(indexMetacarpal);
      palmSamples += 1;
    }

    if (pinkyMetacarpal) {
      palmPosition.add(pinkyMetacarpal);
      palmSamples += 1;
    }

    palmPosition.multiplyScalar(1 / palmSamples);

    const fingertips = [indexTip, middleTip, ringTip, pinkyTip].filter(Boolean);
    const openingRatio = fingertips.reduce((sum, tip) => sum + tip.distanceTo(wrist), 0) / Math.max(1, fingertips.length);
    const pinchDistance = indexTip.distanceTo(thumbTip);

    return {
      handedness: inputSource.handedness,
      palmPosition,
      indexTip,
      thumbTip,
      openingRatio,
      pinchDistance,
      quaternion: new THREE.Quaternion()
    };
  }

  handlePalmOpen(hand, time) {
    const isOpen = hand.openingRatio > 0.105;
    const canTrigger = time - this.lastPalmBloomAt > 2.2;

    if (isOpen && !this.palmWasOpen && canTrigger) {
      this.skills.invoke('palm-open-bloom', hand, true);
      this.lastPalmBloomAt = time;
      this.status.textContent = '掌心绽放已触发';
    }

    this.palmWasOpen = isOpen;
  }

  handleFingerTap(hand, time) {
    const isPinched = hand.pinchDistance < 0.028;
    const canTrigger = time - this.lastFingerTapAt > 0.55;

    if (isPinched && !this.tapWasPinched && canTrigger) {
      this.skills.invoke('finger-tap-moss-ripple', hand.indexTip);
      this.lastFingerTapAt = time;
      this.status.textContent = '指尖苔痕已触发';
    }

    this.tapWasPinched = isPinched;
  }

  handleTwoHandStretch(left, right, time) {
    const distance = left.palmPosition.distanceTo(right.palmPosition);
    const canTrigger = time - this.lastStretchAt > 1.2;

    if (distance > 0.15 && canTrigger) {
      this.skills.invoke('two-hand-mycelium-stretch', left.palmPosition, right.palmPosition, distance);
      this.lastStretchAt = time;
      this.status.textContent = '菌丝拉伸已触发';
    }
  }
}
