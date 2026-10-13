// 管理员密码重置工具（可复用）
// 用法：
//   node scripts/reset-password.mjs                         # 交互模式，提示输入邮箱和新密码
//   node scripts/reset-password.mjs admin@moyublog.com 新密码   # 命令行参数模式
// 密码不会被回显到 shell history（交互模式用 readline）
import { createInterface } from "readline";
import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

function ask(rl, q) {
  return new Promise((r) => rl.question(q, r));
}

// 交互模式下隐藏密码输入（关闭 TTY 回显）
function askHidden(q) {
  return new Promise((r) => {
    process.stdout.write(q);
    const chunks = [];
    const onData = (c) => {
      const s = c.toString();
      if (s.includes("\r") || s.includes("\n")) {
        process.stdin.removeListener("data", onData);
        process.stdin.setRawMode(false);
        process.stdout.write("\n");
        r(chunks.join(""));
      } else if (s === "\x03" || s === "\x04") {
        // Ctrl+C / Ctrl+D
        process.stdin.removeListener("data", onData);
        process.stdin.setRawMode(false);
        process.exit(0);
      } else {
        chunks.push(s);
      }
    };
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", onData);
  });
}

async function main() {
  let email = process.argv[2];
  let newPassword = process.argv[3];

  if (!email || !newPassword) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    email = email || (await ask(rl, "管理员邮箱（回车默认 admin@moyublog.com）：")).trim();
    if (!email) email = "admin@moyublog.com";
    rl.close();
    newPassword = (await askHidden("输入新密码（输入不可见，回车确认）：")).trim();
    if (!newPassword) {
      console.log("\n密码不能为空，已取消。");
      process.exit(1);
    }
  }

  if (newPassword.length < 8) {
    console.log("密码至少 8 位，已取消。");
    process.exit(1);
  }

  // 先查用户是否存在
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log(`未找到邮箱 ${email} 的账号。`);
    console.log("当前所有账号：");
    const all = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
    all.forEach((u) => console.log(`  - ${u.email}  (${u.name})`));
    process.exit(1);
  }

  const hash = await bcryptjs.hash(newPassword, 10);
  await prisma.user.update({ where: { email }, data: { password: hash } });
  console.log(`\n✓ 已重置 ${email} 的密码。现在可以用新密码登录 /admin/login。`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("出错：", e?.message || e);
  process.exit(1);
});
