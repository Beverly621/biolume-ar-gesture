const REQUIRED_SKILLS = [
  {
    id: 'palm-open-bloom',
    method: 'handlePalmOpen',
    description: '掌心张开时触发花卉绽放与孢子粒子发射'
  },
  {
    id: 'finger-tap-moss-ripple',
    method: 'handleFingerTap',
    description: '食指轻点时触发苔藓实例与水波纹 Shader'
  },
  {
    id: 'two-hand-mycelium-stretch',
    method: 'handleTwoHandStretch',
    description: '双手拉伸时触发菌丝贝塞尔网络与粒子流'
  }
];

/**
 * 前端技能模块注册器。
 *
 * 这里的“skills”不是第三方密钥或远端脚本，而是 AR 交互能力模块。
 * 注册器负责在运行时校验核心控制函数是否齐备，避免某个构建环境漏加载模块后静默失败。
 */
export function initializeEcoDruidSkillRuntime(manager) {
  if (!manager) {
    throw new Error('技能运行时初始化失败：缺少 EcoDruidVFXManager 实例。');
  }

  const registered = new Map();
  const missing = [];

  for (const skill of REQUIRED_SKILLS) {
    if (typeof manager[skill.method] !== 'function') {
      missing.push(`${skill.id} -> ${skill.method}`);
      continue;
    }

    registered.set(skill.id, {
      ...skill,
      invoke: (...args) => manager[skill.method](...args)
    });
  }

  if (missing.length > 0) {
    throw new Error(`技能模块缺失：${missing.join(', ')}`);
  }

  return {
    list() {
      return [...registered.values()].map(({ invoke, ...skill }) => skill);
    },
    get(id) {
      return registered.get(id);
    },
    invoke(id, ...args) {
      const skill = registered.get(id);
      if (!skill) throw new Error(`未知技能模块：${id}`);
      return skill.invoke(...args);
    }
  };
}

export const EcoDruidRequiredSkills = REQUIRED_SKILLS;
