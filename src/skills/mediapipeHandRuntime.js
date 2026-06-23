/*
 * Copyright (C) 2026 Beverly621
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import * as THREE from 'three';

const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands';
let handsScriptPromise = null;

function loadHandsScript() {
  if (window.Hands) return Promise.resolve();
  if (handsScriptPromise) return handsScriptPromise;

  handsScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-skill-id="mediapipe-hands"]');
    if (existing) {
      existing.addEventListener('load', resolve, { once: true });
      existing.addEventListener('error', () => reject(new Error('MediaPipe Hands 技能脚本加载失败。')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = `${MEDIAPIPE_CDN}/hands.js`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.skillId = 'mediapipe-hands';
    script.addEventListener('load', resolve, { once: true });
    script.addEventListener('error', () => reject(new Error('MediaPipe Hands 技能脚本加载失败。')), { once: true });
    document.head.appendChild(script);
  });

  return handsScriptPromise;
}

function landmarkDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z ?? 0) - (b.z ?? 0));
}

function landmarkToScenePoint(landmark) {
  const mirrorX = 1 - landmark.x;
  return new THREE.Vector3(
    (mirrorX - 0.5) * 1.55,
    (0.52 - landmark.y) * 1.25 + 0.74,
    0.26 + Math.min(0.18, Math.max(-0.08, -(landmark.z ?? 0) * 0.55))
  );
}

function landmarksToHand(landmarks, handedness = 'unknown') {
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  const palmLandmarks = [landmarks[0], landmarks[5], landmarks[17]].filter(Boolean);
  const palmPosition = palmLandmarks
    .map(landmarkToScenePoint)
    .reduce((sum, point) => sum.add(point), new THREE.Vector3())
    .multiplyScalar(1 / palmLandmarks.length);

  const openingRatio = [indexTip, middleTip, ringTip, pinkyTip]
    .filter(Boolean)
    .reduce((sum, tip) => sum + landmarkDistance(tip, wrist), 0) / 4;

  return {
    handedness,
    palmPosition,
    indexTip: landmarkToScenePoint(indexTip),
    thumbTip: landmarkToScenePoint(thumbTip),
    openingRatio,
    pinchDistance: landmarkDistance(indexTip, thumbTip),
    quaternion: new THREE.Quaternion()
  };
}

export async function createCameraHandTracker({ video, skills, status, onGesture }) {
  await loadHandsScript();
  if (!window.Hands) throw new Error('MediaPipe Hands 未暴露 window.Hands。');

  const handsModel = new window.Hands({
    locateFile: (file) => `${MEDIAPIPE_CDN}/${file}`
  });

  handsModel.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.62,
    minTrackingConfidence: 0.58
  });

  let running = false;
  let frameHandle = 0;
  let lastVideoTime = -1;
  let isProcessing = false;
  let lastFingerTapAt = -Infinity;
  let lastStretchAt = -Infinity;
  let tapWasPinched = false;

  handsModel.onResults((results) => {
    const landmarks = results.multiHandLandmarks || [];
    const handednessList = results.multiHandedness || [];
    const now = performance.now() * 0.001;

    if (!landmarks.length) {
      status.textContent = 'Tracking Hands / 正在识别手势：请将手放入画面';
      tapWasPinched = false;
      return;
    }

    status.textContent = `Tracking Hands / 正在识别手势：已识别 ${landmarks.length}/2 只手`;

    const hands = landmarks.map((handLandmarks, index) => {
      const label = handednessList[index]?.label?.toLowerCase() || `hand-${index}`;
      return landmarksToHand(handLandmarks, label);
    });

    const activeHand = hands[0];
    const isOpen = activeHand.openingRatio > 0.28;
    skills.invoke('palm-open-bloom', activeHand, isOpen);
    if (isOpen) {
      onGesture('bloom');
    }

    const isPinched = activeHand.pinchDistance < 0.055;
    if (isPinched && !tapWasPinched && now - lastFingerTapAt > 0.75) {
      skills.invoke('finger-tap-moss-ripple', activeHand.indexTip);
      onGesture('moss');
      lastFingerTapAt = now;
    }
    tapWasPinched = isPinched;

    if (hands.length >= 2) {
      const distance = hands[0].palmPosition.distanceTo(hands[1].palmPosition);
      if (distance > 0.3 && now - lastStretchAt > 0.65) {
        skills.invoke('two-hand-mycelium-stretch', hands[0].palmPosition, hands[1].palmPosition, distance);
        onGesture('web');
        lastStretchAt = now;
      }
    }
  });

  async function processFrame() {
    if (!running) return;

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.currentTime !== lastVideoTime && !isProcessing) {
      lastVideoTime = video.currentTime;
      isProcessing = true;
      try {
        await handsModel.send({ image: video });
      } catch (error) {
        status.textContent = `Tracking Hands 异常：${error.message || error}`;
      } finally {
        isProcessing = false;
      }
    }

    frameHandle = requestAnimationFrame(processFrame);
  }

  return {
    start() {
      if (running) return;
      running = true;
      status.textContent = 'Tracking Hands / 正在识别手势';
      frameHandle = requestAnimationFrame(processFrame);
    },
    stop() {
      running = false;
      if (frameHandle) cancelAnimationFrame(frameHandle);
      frameHandle = 0;
      handsModel.close?.();
    }
  };
}
