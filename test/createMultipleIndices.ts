// createMultipleIndices.ts
// 使用 Bun + fetch 直接操作 Elasticsearch，创建多种类型的索引用于测试懒加载

// ========================
// 配置
// ========================
const ELASTICSEARCH_HOST = "http://127.0.0.1:9200"; // ES 服务器地址
const BATCH_SIZE = 100; // 批量插入大小

// 索引类型配置
const INDEX_TYPES = [
  {
    name: "logs",
    pattern: "logs-",
    alias: "logs-current",
    count: 25, // 创建25个索引
    mapping: {
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
    },
    generateData: generateLogData
  },
  {
    name: "nginx",
    pattern: "nginx-log-",
    alias: "nginx-current",
    count: 20, // 创建20个索引
    mapping: {
      properties: {
        "@timestamp": { type: "date" },
        remote_addr: { type: "ip" },
        remote_user: { type: "keyword" },
        request: { type: "text" },
        method: { type: "keyword" },
        url: { type: "keyword" },
        http_version: { type: "keyword" },
        status: { type: "short" },
        body_bytes_sent: { type: "long" },
        http_referer: { type: "text" },
        http_user_agent: { type: "text" },
        request_time: { type: "float" },
        upstream_response_time: { type: "float" }
      }
    },
    generateData: generateNginxData
  },
  {
    name: "app",
    pattern: "app-trace-",
    alias: "app-current",
    count: 20, // 创建20个索引
    mapping: {
      properties: {
        "@timestamp": { type: "date" },
        trace_id: { type: "keyword" },
        span_id: { type: "keyword" },
        parent_span_id: { type: "keyword" },
        service: { type: "keyword" },
        operation: { type: "keyword" },
        duration: { type: "long" },
        tags: { type: "object" },
        logs: {
          properties: {
            timestamp: { type: "date" },
            message: { type: "text" }
          }
        }
      }
    },
    generateData: generateAppTraceData
  },
  {
    name: "metrics",
    pattern: "metrics-",
    alias: "metrics-current",
    count: 20, // 创建20个索引
    mapping: {
      properties: {
        "@timestamp": { type: "date" },
        metric_name: { type: "keyword" },
        value: { type: "float" },
        tags: {
          properties: {
            host: { type: "keyword" },
            service: { type: "keyword" },
            environment: { type: "keyword" }
          }
        },
        unit: { type: "keyword" }
      }
    },
    generateData: generateMetricsData
  },
  {
    name: "audit",
    pattern: "audit-log-",
    alias: "audit-current",
    count: 20, // 创建20个索引
    mapping: {
      properties: {
        "@timestamp": { type: "date" },
        user: { type: "keyword" },
        action: { type: "keyword" },
        resource: { type: "keyword" },
        resource_id: { type: "keyword" },
        ip_address: { type: "ip" },
        user_agent: { type: "text" },
        status: { type: "keyword" },
        details: { type: "object" }
      }
    },
    generateData: generateAuditData
  }
];

// ========================
// 模拟数据生成函数
// ========================

// 生成随机时间：最近 30 天内
function randomTimestamp(): string {
  const now = new Date();
  const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 天前
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

// 生成随机用户代理
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
  "Mozilla/5.0 (Linux; Android 10; Pixel 4) AppleWebKit/537.36"
];

// 生成日志数据
function generateLogData(): any {
  const levels = ["INFO", "WARN", "ERROR", "DEBUG"];
  const services = ["auth-service", "payment-gateway", "user-api", "order-processor"];
  const users = ["alice", "bob", "charlie", "diana"];
  const actions = ["login", "logout", "purchase", "update_profile"];

  const level = levels[Math.floor(Math.random() * levels.length)];
  const service = services[Math.floor(Math.random() * services.length)];
  const user = users[Math.floor(Math.random() * users.length)];
  const action = actions[Math.floor(Math.random() * actions.length)];
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  const durationMs = Math.floor(Math.random() * 2000);
  const statusCode = [200, 200, 200, 201, 400, 401, 403, 404, 500][Math.floor(Math.random() * 9)];

  return {
    "@timestamp": randomTimestamp(),
    log: {
      level,
      logger: service,
      message: `${level}: User ${user} performed ${action}`
    },
    service: { name: service },
    user: { name: user },
    http: {
      request: { method: ["GET", "POST", "PUT", "DELETE"][Math.floor(Math.random() * 4)] },
      response: { status_code: statusCode, "body.bytes": Math.floor(Math.random() * 10000) },
      user_agent: { original: userAgent }
    },
    url: { path: `/${action}` },
    client: { ip: randomIP() },
    event: { duration: durationMs },
    tags: level === "ERROR" ? ["error", service] : [service]
  };
}

// 生成 Nginx 日志数据
function generateNginxData(): any {
  const methods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
  const urls = ["/api/users", "/api/orders", "/api/products", "/login", "/logout", "/dashboard"];
  const statuses = [200, 201, 301, 302, 400, 401, 403, 404, 500];

  return {
    "@timestamp": randomTimestamp(),
    remote_addr: randomIP(),
    remote_user: ["alice", "bob", "charlie", "diana"][Math.floor(Math.random() * 4)],
    request: `${methods[Math.floor(Math.random() * methods.length)]} ${urls[Math.floor(Math.random() * urls.length)]} HTTP/1.1`,
    method: methods[Math.floor(Math.random() * methods.length)],
    url: urls[Math.floor(Math.random() * urls.length)],
    http_version: "HTTP/1.1",
    status: statuses[Math.floor(Math.random() * statuses.length)],
    body_bytes_sent: Math.floor(Math.random() * 5000),
    http_referer: "https://example.com/",
    http_user_agent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    request_time: Math.random() * 5,
    upstream_response_time: Math.random() * 3
  };
}

// 生成应用追踪数据
function generateAppTraceData(): any {
  const services = ["user-service", "order-service", "payment-service", "inventory-service"];
  const operations = ["get_user", "create_order", "process_payment", "check_inventory"];

  return {
    "@timestamp": randomTimestamp(),
    trace_id: "trace-" + Math.random().toString(36).substring(2, 15),
    span_id: "span-" + Math.random().toString(36).substring(2, 10),
    parent_span_id:
      Math.random() > 0.5 ? "span-" + Math.random().toString(36).substring(2, 10) : null,
    service: services[Math.floor(Math.random() * services.length)],
    operation: operations[Math.floor(Math.random() * operations.length)],
    duration: Math.floor(Math.random() * 5000),
    tags: {
      environment: ["production", "staging", "development"][Math.floor(Math.random() * 3)],
      version: "v" + Math.floor(Math.random() * 5 + 1) + "." + Math.floor(Math.random() * 10)
    },
    logs: {
      timestamp: randomTimestamp(),
      message: "Trace operation completed"
    }
  };
}

// 生成指标数据
function generateMetricsData(): any {
  const metricNames = ["cpu_usage", "memory_usage", "disk_io", "network_traffic", "request_rate"];
  const units = ["%", "MB", "MB/s", "req/s"];
  const services = ["web-server", "database", "cache", "load-balancer"];

  return {
    "@timestamp": randomTimestamp(),
    metric_name: metricNames[Math.floor(Math.random() * metricNames.length)],
    value: Math.random() * 100,
    tags: {
      host: "host-" + Math.floor(Math.random() * 10),
      service: services[Math.floor(Math.random() * services.length)],
      environment: ["production", "staging", "development"][Math.floor(Math.random() * 3)]
    },
    unit: units[Math.floor(Math.random() * units.length)]
  };
}

// 生成审计日志数据
function generateAuditData(): any {
  const users = ["alice", "bob", "charlie", "diana", "admin"];
  const actions = ["CREATE", "UPDATE", "DELETE", "READ", "LOGIN", "LOGOUT"];
  const resources = ["user", "order", "product", "settings", "report"];

  return {
    "@timestamp": randomTimestamp(),
    user: users[Math.floor(Math.random() * users.length)],
    action: actions[Math.floor(Math.random() * actions.length)],
    resource: resources[Math.floor(Math.random() * resources.length)],
    resource_id: Math.floor(Math.random() * 10000).toString(),
    ip_address: randomIP(),
    user_agent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    status: Math.random() > 0.1 ? "SUCCESS" : "FAILURE",
    details: {
      description: "Performed action on resource"
    }
  };
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

// 创建索引
async function createIndex(client: typeof fetch, index: string, mapping: any) {
  const body = {
    mappings: mapping
  };

  const resp = await client(`${ELASTICSEARCH_HOST}/${index}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (resp.ok) {
    console.log(`✅ 索引 '${index}' 创建成功`);
    return true;
  } else {
    const error = await resp.text();
    console.error(`❌ 创建索引 '${index}' 失败: ${resp.status} ${resp.statusText}\n${error}`);
    return false;
  }
}

// 添加别名
async function addAlias(client: typeof fetch, index: string, alias: string) {
  const body = {
    actions: [{ add: { index, alias } }]
  };

  const resp = await client(`${ELASTICSEARCH_HOST}/_aliases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (resp.ok) {
    console.log(`✅ 为索引 '${index}' 添加别名 '${alias}' 成功`);
  } else {
    const error = await resp.text();
    console.error(
      `❌ 为索引 '${index}' 添加别名 '${alias}' 失败: ${resp.status} ${resp.statusText}\n${error}`
    );
  }
}

// 批量插入数据
async function bulkInsert(client: typeof fetch, index: string, data: any[]) {
  const body =
    data
      .flatMap((doc) => [
        JSON.stringify({ index: { _index: index } }),
        JSON.stringify(doc)
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
    console.log(`✅ 成功插入 ${success}/${data.length} 条数据到索引 '${index}'`);
  }
}

// ========================
// 主函数
// ========================
async function main() {
  console.log("🚀 开始生成多种类型的 Elasticsearch 测试索引...");

  const client = fetch; // 使用 Bun 内置的 fetch

  let totalIndices = 0;
  let totalDocs = 0;

  // 为每种索引类型创建索引
  for (const indexType of INDEX_TYPES) {
    console.log(`\n🔧 处理索引类型: ${indexType.name}`);

    // 创建多个索引
    for (let i = 0; i < indexType.count; i++) {
      // 生成索引名称，格式如 logs-202510, logs-202509 等
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const indexName = `${indexType.pattern}${year}${month}`;

      totalIndices++;

      // 1. 检查索引是否存在，不存在则创建
      if (await indexExists(client, indexName)) {
        console.log(`🔍 索引 '${indexName}' 已存在，跳过创建。`);
      } else {
        console.log(`🔨 正在创建索引 '${indexName}'...`);
        const created = await createIndex(client, indexName, indexType.mapping);
        if (!created) continue;
      }

      // 2. 添加别名
      await addAlias(client, indexName, indexType.alias);

      // 3. 生成并插入数据 (每个索引1000条记录)
      console.log(`📝 正在为索引 '${indexName}' 生成 1000 条数据...`);
      const TOTAL_DOCS = 1000;

      for (let j = 0; j < TOTAL_DOCS; j += BATCH_SIZE) {
        const batch = Array.from(
          { length: Math.min(BATCH_SIZE, TOTAL_DOCS - j) },
          indexType.generateData
        );
        await bulkInsert(client, indexName, batch);
        totalDocs += batch.length;
      }

      console.log(`📊 索引 '${indexName}' 数据生成完成`);
    }
  }

  console.log(`\n🎉 全部完成！总共创建了 ${totalIndices} 个索引，插入了 ${totalDocs} 条文档`);
}

// 运行主函数
main().catch((err) => {
  console.error("❌ 脚本执行出错:", err);
  process.exit(1);
});
