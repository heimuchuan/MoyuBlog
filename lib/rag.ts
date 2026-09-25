import type OpenAI from "openai";

const chatModel = process.env.CHAT_MODEL || "deepseek-ai/DeepSeek-V3";
const embedModel = process.env.EMBED_MODEL || "BAAI/bge-m3";

let clientPromise: Promise<OpenAI> | null = null;

async function getClient(): Promise<OpenAI> {
  if (!clientPromise) {
    clientPromise = import("openai").then(({ default: OpenAI }) => {
      const baseURL = process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1";
      const apiKey = process.env.SILICONFLOW_API_KEY || "";
      return new OpenAI({ apiKey, baseURL });
    });
  }
  return clientPromise;
}

// 调嵌入模型把文本转成向量
export async function getEmbedding(text: string): Promise<number[]> {
  const client = await getClient();
  const res = await client.embeddings.create({ model: embedModel, input: text });
  return res.data[0].embedding;
}

// 余弦相似度（应用层计算）
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export type Context = { content: string; title: string };

// 组合参考资料 + 调用大模型生成答案
export async function askQuestion(question: string, contexts: Context[]): Promise<string> {
  const refs = contexts
    .map((c, i) => `【资料${i + 1}】《${c.title}》\n${c.content}`)
    .join("\n\n");

  const system =
    "你是校园知识问答助手。请依据提供的参考资料回答用户问题，遵守以下规则：\n" +
    "1. 先给出结论；\n2. 再补充关键细节；\n3. 综合多份资料，不要机械照抄原文；\n" +
    "4. 资料中没有的信息不要编造，明确说明不清楚；\n5. 语气友好、条理清晰。";

  const user = `参考资料：\n${refs}\n\n用户问题：${question}\n\n请回答，并在末尾用“参考资料：[序号]”列出你实际引用的资料序号。`;

  const client = await getClient();
  const res = await client.chat.completions.create({
    model: chatModel,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.7,
  });
  return res.choices[0].message.content || "";
}