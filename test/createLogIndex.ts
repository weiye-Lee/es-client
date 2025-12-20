// generate-logs.ts
// 使用 Bun + fetch 直接操作 Elasticsearch，无需 @elastic/elasticsearch

// ========================
// 配置
// ========================
const ELASTICSEARCH_HOST = "http://localhost:9200"; // 请确保你的 ES 正在运行
const INDEX_NAME = "logs-app-2025.08"; // 模拟按月分片的索引
const TOTAL_LOGS = 1000; // 要生成的日志数量
const BATCH_SIZE = 100; // 批量插入大小

// ========================
// 模拟数据源
// ========================
const LEVELS = ["INFO", "WARN", "ERROR", "DEBUG"] as const;

const SERVICES = [
  "auth-service",
  "payment-gateway",
  "user-api",
  "order-processor",
  "notification-worker"
];
const USERS = ["alice", "bob", "charlie", "diana", "eve", "mallory", "admin"];
const ACTIONS = ["login", "logout", "purchase", "update_profile", "reset_password", "view_page"];
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15",
  "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36"
];

// 生成随机时间：最近 7 天内
function randomTimestamp(): string {
  const now = new Date();
  const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 天前
  const randomTime = new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
  return randomTime.toISOString();
}

// 生成随机 IP
function randomIP(): string {
  return Array(4)
    .fill(0)
    .map(() => Math.floor(Math.random() * 256))
    .join(".");
}

// 生成一条模拟日志
function generateLog(): any {
  const level = LEVELS[Math.floor(Math.random() * LEVELS.length)];
  const service = SERVICES[Math.floor(Math.random() * SERVICES.length)];
  const user = USERS[Math.floor(Math.random() * USERS.length)];
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  const durationMs = Math.floor(Math.random() * 2000); // 响应时间 0-2s
  const statusCode = [200, 200, 200, 201, 400, 401, 403, 404, 500, 502][
    Math.floor(Math.random() * 10)
  ];

  return {
    "@timestamp": randomTimestamp(),
    log: {
      level,
      logger: service,
      message: generateLogMessage(level, action, user, statusCode)
    },
    service: { name: service },
    user: { name: user },
    http: {
      request: { method: ["GET", "POST", "PUT", "DELETE"][Math.floor(Math.random() * 4)] },
      response: { status_code: statusCode, body: { bytes: Math.floor(Math.random() * 10000) } },
      user_agent: { original: userAgent }
    },
    url: { path: `/${action}` },
    client: { ip: randomIP() },
    event: { duration: durationMs },
    tags: level === "ERROR" ? ["error", service] : [service]
  };
}

function generateLogMessage(level: string, action: string, user: string, status: number): string {
  const messages: Record<string, string[]> = {
    INFO: [
      `User ${user} successfully performed ${action}.`,
      `Background job completed for user ${user}.`,
      `Cache refreshed for service ${action}.`,
      `Scheduled task '${action}' executed.`
    ],
    WARN: [
      `User ${user} attempted ${action} with deprecated endpoint.`,
      `High latency detected for ${action} (status=${status}).`,
      `Rate limit approaching for user ${user}.`,
      `Deprecated API usage detected.`
    ],
    ERROR: [
      `Failed to process ${action} for user ${user} (status=${status}).`,
      `Database connection timeout during ${action}.`,
      `Authentication failed for user ${user}.`,
      `External service unavailable: ${action}.`
    ],
    DEBUG: [
      `Debug: Entering ${action} handler for user ${user}.`,
      `Session state: active, user=${user}, action=${action}.`,
      `Cache miss for key '${action}:${user}'.`,
      `Executing query with params: {user: '${user}', action: '${action}'}`
    ]
  };
  const pool = messages[level] || messages.INFO;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ========================
// Elasticsearch 操作
// ========================

// 检查索引是否存在
async function indexExists(client: typeof fetch, index: string): Promise<boolean> {
  const resp = await client(`${ELASTICSEARCH_HOST}/${index}`, {
    method: "HEAD"
  });
  return resp.ok;
}

// 创建索引（兼容 Elasticsearch 6.6.2：需要类型 `_doc`）
async function createIndex(client: typeof fetch) {
  const mapping = {
    mappings: {
      properties: {
        "@timestamp": { type: "date" },
        log: {
          properties: {
            level: { type: "keyword" },
            logger: { type: "keyword" },
            message: { type: "text" }
          }
        },
        service: {
          properties: {
            name: { type: "keyword" }
          }
        },
        user: {
          properties: {
            name: { type: "keyword" }
          }
        },
        http: {
          properties: {
            request: {
              properties: {
                method: { type: "keyword" }
              }
            },
            response: {
              properties: {
                status_code: { type: "short" },
                "body.bytes": { type: "long" }
              }
            },
            user_agent: {
              properties: {
                original: { type: "text" }
              }
            }
          }
        },
        url: {
          properties: {
            path: { type: "keyword" }
          }
        },
        client: {
          properties: {
            ip: { type: "ip" }
          }
        },
        event: {
          properties: {
            duration: { type: "long" }
          }
        },
        tags: { type: "keyword" }
      }
    }
  };

  const resp = await client(`${ELASTICSEARCH_HOST}/${INDEX_NAME}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mapping)
  });

  if (resp.ok) {
    console.log(`✅ 索引 '${INDEX_NAME}' 创建成功`);
  } else {
    const error = await resp.text();
    console.error(`❌ 创建索引失败: ${resp.status} ${resp.statusText}\n${error}`);
    process.exit(1);
  }
}

// 批量插入日志（ES 6.6.2 需要指定 _type）
async function bulkInsert(client: typeof fetch, logs: any[]) {
  const body =
    logs
      .flatMap((log) => [
        JSON.stringify({ index: { _index: INDEX_NAME, _type: "_doc" } }),
        JSON.stringify(log)
      ])
      .join("\n") + "\n";

  const resp = await client(`${ELASTICSEARCH_HOST}/_bulk?refresh=wait_for`, {
    method: "POST",
    headers: { "Content-Type": "application/x-ndjson" },
    body
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Bulk 请求失败: ${resp.status} ${resp.statusText} - ${text}`);
  }

  const result = await resp.json();
  const items = Array.isArray(result.items) ? result.items : [];
  if (result.errors) {
    const errors = items.filter((i: any) => i.index?.error);
    console.error("⚠️  批量插入出现错误:", errors.length ? errors : result);
  } else {
    const success = items.filter((i: any) => i.index && !i.index.error).length;
    console.log(`✅ 成功插入 ${success}/${logs.length} 条日志`);
  }
}

// ========================
// 主函数
// ========================
async function main() {
  console.log("🚀 开始生成 Elasticsearch 测试日志...");

  const client = fetch; // 使用 Bun 内置的 fetch

  // 1. 检查索引是否存在，不存在则创建
  if (await indexExists(client, INDEX_NAME)) {
    console.log(`🔍 索引 '${INDEX_NAME}' 已存在，跳过创建。`);
  } else {
    console.log(`🔨 正在创建索引 '${INDEX_NAME}'...`);
    await createIndex(client);
  }

  // 2. 生成并插入日志
  console.log(`📝 正在生成 ${TOTAL_LOGS} 条日志数据...`);

  for (let i = 0; i < TOTAL_LOGS; i += BATCH_SIZE) {
    const batch = Array.from({ length: Math.min(BATCH_SIZE, TOTAL_LOGS - i) }, generateLog);
    await bulkInsert(client, batch);
  }

  // 验证最终文档数
  try {
    const countResp = await client(`${ELASTICSEARCH_HOST}/${INDEX_NAME}/_count`, { method: "GET" });
    const countJson = await countResp.json();
    console.log(`📊 索引 '${INDEX_NAME}' 当前文档数: ${countJson.count}`);
  } catch (e) {
    console.warn("⚠️ 无法获取文档总数:", e);
  }

  console.log("🎉 测试数据生成完毕！");
}

// 运行主函数
main().catch((err) => {
  console.error("❌ 脚本执行出错:", err);
  process.exit(1);
});
