// MoyuBlog 后台模块 API 端到端测试模板
// 用法：复制到 %TEMP% 或项目外临时目录（不要留在仓库里），改 BASE_URL/用例后 `node xxx.mjs`
// 依赖：Node 18+ 原生 fetch（本环境 Node 24 可用）。不要用 PowerShell 5.1 改写本脚本。

const BASE_URL = "http://localhost:3000";
const ADMIN = { email: "admin@moyublog.com", password: "admin123456" };

let failures = 0;
const check = (cond, msg) => {
  console.log(`${cond ? "PASS" : "FAIL"}: ${msg}`);
  if (!cond) failures++;
};

// —— 极简 Cookie Jar：合并 Set-Cookie，同名覆盖 ——
class Jar {
  constructor() {
    this.map = new Map();
  }
  absorb(res) {
    for (const sc of res.headers.getSetCookie?.() ?? []) {
      const [pair] = sc.split(";");
      const i = pair.indexOf("=");
      this.map.set(pair.slice(0, i), pair.slice(i + 1));
    }
  }
  header() {
    return [...this.map.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }
  send(init = {}) {
    return { ...init, headers: { ...(init.headers || {}), Cookie: this.header() } };
  }
}

async function login() {
  const jar = new Jar();
  // 1. CSRF（同时种 cookie）
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  jar.absorb(csrfRes);
  const { csrfToken } = await csrfRes.json();
  // 2. Credentials 回调
  const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: jar.header() },
    body: new URLSearchParams({
      csrfToken,
      email: ADMIN.email,
      password: ADMIN.password,
      callbackUrl: `${BASE_URL}/admin`,
      json: "true",
    }),
    redirect: "manual",
  });
  jar.absorb(loginRes);
  return jar;
}

// 私密板块（如记账）额外解锁示例：
// const r = await fetch(`${BASE_URL}/api/<module>/unlock`, {
//   method: "POST",
//   headers: { "Content-Type": "application/json", Cookie: jar.header() },
//   body: JSON.stringify({ password: "..." }),
// });
// jar.absorb(r);

async function main() {
  const jar = await login();

  // —— 1. 鉴权：未登录必须 401（用全新请求，不带 jar）——
  const anon = await fetch(`${BASE_URL}/api/<module>?start=x&end=y`);
  check(anon.status === 401, `未登录 GET 401（实际 ${anon.status}）`);

  // —— 2. 创建 ——
  const created = await fetch(`${BASE_URL}/api/<module>`, {
    ...jar.send({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ /* 字段 */ amount: 3550, note: "昨天 测试" }),
    }),
  }).then((r) => r.json());
  check(!!created.id, `创建成功 id=${created.id}`);
  // check(created.date === "2026-09-23", "智能字段正确");

  // 文件上传（multipart，不要手拼 boundary）：
  // const form = new FormData();
  // form.append("file", new Blob([bytes], { type: "image/png" }), "x.png");
  // await fetch(`${BASE_URL}/api/<module>`, { ...jar.send({ method: "POST", body: form }) });

  // —— 3. 查询/聚合 ——
  // const list = await fetch(`${BASE_URL}/api/<module>?start=...&end=...`, jar.send()).then((r) => r.json());
  // check(Array.isArray(list) && list.length === 1, "列表含新记录");

  // —— 4. 校验：非法入参 400、类型/边界 ——

  // —— 5. 清理（必须，保证测试可重复运行）——
  await fetch(`${BASE_URL}/api/<module>`, {
    ...jar.send({
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: created.id }),
    }),
  });
  // 复查清理后计数为 0

  console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
