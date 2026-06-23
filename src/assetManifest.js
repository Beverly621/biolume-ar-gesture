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

export const ECO_DRUID_ASSETS = Object.freeze({
  backgroundForest: '/assets/eco-vfx/biolume-forest.jpeg',
  glowingLily: '/assets/eco-vfx/glowing-lily.png',
  mossCluster: '/assets/eco-vfx/moss-cluster.png',
  myceliumBranch: '/assets/eco-vfx/mycelium-branch.png',
  translucentPetalVines: '/assets/eco-vfx/leaf-atlas.png',
  borderPlants: [
    '/assets/eco-vfx/garden-cluster.png',
    '/assets/eco-vfx/moss-cluster.png',
    '/assets/eco-vfx/border-canopy-a.png',
    '/assets/eco-vfx/border-canopy-b.png',
    '/assets/eco-vfx/border-canopy-c.png',
    '/assets/eco-vfx/border-canopy-d.png',
    '/assets/eco-vfx/border-canopy-e.png',
    '/assets/eco-vfx/border-vine-a.png',
    '/assets/eco-vfx/border-vine-b.png',
    '/assets/eco-vfx/border-vine-c.png',
    '/assets/eco-vfx/border-vine-d.png',
    '/assets/eco-vfx/border-leaf-sprig.png'
  ],
  spores: '/assets/ui/eco-seed.png',
  leafGlow: '/assets/eco-vfx/glowing-lily.png'
});

export const ECO_DRUID_ASSET_TODO = Object.freeze([
  '当前已接入 PNG alpha 抠图素材；后续可补充压缩 WebP / AVIF 版本以减小 Release 包体积。'
]);
