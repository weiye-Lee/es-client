// @ts-nocheck
// 使用Bun创建ES索引并插入高精度测试数据 (ES 7.7.2兼容版本)

// 配置ES连接信息
const ES_HOST = "http://localhost:9200";
const INDEX_NAME = "location_data-2";

// 创建索引的映射定义 (ES 7.7.2兼容)
const indexMapping = {
  mappings: {
    properties: {
      id: {
        type: "keyword"
      },
      name: {
        type: "text",
        fields: {
          keyword: {
            type: "keyword"
          }
        }
      },
      location: {
        type: "geo_point"
      },
      latitude: {
        type: "double",
        doc_values: true
      },
      longitude: {
        type: "double",
        doc_values: true
      },
      address: {
        type: "text",
        fields: {
          keyword: {
            type: "keyword"
          }
        }
      },
      category: {
        type: "keyword"
      },
      rating: {
        type: "float"
      },
      created_at: {
        type: "date"
      },
      tags: {
        type: "keyword"
      }
    }
  },
  settings: {
    number_of_shards: 1,
    number_of_replicas: 0,
    refresh_interval: "30s"
  }
};

// 生成高精度随机经纬度的函数 (14位小数)
function generateHighPrecisionLocation() {
  // 以中国范围为例生成高精度随机经纬度
  // 使用字符串操作确保精度
  const baseLat = (20 + Math.random() * 40).toFixed(6);
  const baseLon = (75 + Math.random() * 60).toFixed(6);

  // 添加额外的小数位以达到14位精度
  const extraLat = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, "0");
  const extraLon = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, "0");

  const highPrecisionLatStr = `${baseLat}${extraLat}`.substring(0, baseLat.length + 8);
  const highPrecisionLonStr = `${baseLon}${extraLon}`.substring(0, baseLon.length + 8);

  // 转换为数字，保留14位小数
  const highPrecisionLat = Number(highPrecisionLatStr);
  const highPrecisionLon = Number(highPrecisionLonStr);

  return {
    lat: highPrecisionLat,
    lon: highPrecisionLon
  };
}

// 生成测试数据
function generateTestData(count: number) {
  const categories = [
    "restaurant",
    "hotel",
    "park",
    "museum",
    "shop",
    "office",
    "school",
    "hospital"
  ];
  const names = [
    "Central Park",
    "Grand Hotel",
    "Sunset Cafe",
    "Ocean View",
    "Mountain Lodge",
    "City Mall",
    "Tech Hub",
    "Art Gallery",
    "Food Court",
    "Business Center"
  ];
  const tags = [
    "popular",
    "trending",
    "recommended",
    "premium",
    "affordable",
    "luxury",
    "family-friendly",
    "pet-friendly",
    "wheelchair-accessible"
  ];

  const data = [];
  for (let i = 0; i < count; i++) {
    const location = generateHighPrecisionLocation();
    const createdAt = new Date(
      Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
    ).toISOString();

    data.push({
      id: `loc_${i + 1}`,
      name: `${names[Math.floor(Math.random() * names.length)]} ${i + 1}`,
      location: location, // geo_point类型
      latitude: location.lat, // double类型纬度
      longitude: location.lon, // double类型经度
      address: `Address ${i + 1}, Random Street, City`,
      category: categories[Math.floor(Math.random() * categories.length)],
      rating: parseFloat((Math.random() * 5).toFixed(1)), // 0-5评分
      created_at: createdAt,
      tags: [
        tags[Math.floor(Math.random() * tags.length)],
        tags[Math.floor(Math.random() * tags.length)]
      ]
    });
  }
  return data;
}

// 发送HTTP请求的函数
async function makeRequest(url: string, method: string, body?: any) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json"
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${await response.text()}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error making ${method} request to ${url}:`, error);
    throw error;
  }
}

// 检查索引是否存在
async function indexExists() {
  try {
    const response = await makeRequest(`${ES_HOST}/${INDEX_NAME}`, "HEAD");
    return response;
  } catch (error) {
    if (error.message.includes("404")) {
      return false;
    }
    throw error;
  }
}

// 删除现有索引
async function deleteIndex() {
  if (await indexExists()) {
    console.log(`Deleting existing index: ${INDEX_NAME}`);
    await makeRequest(`${ES_HOST}/${INDEX_NAME}`, "DELETE");
    console.log("Index deleted successfully");
  }
}

// 创建索引
async function createIndex() {
  console.log(`Creating index: ${INDEX_NAME}`);
  const result = await makeRequest(`${ES_HOST}/${INDEX_NAME}`, "PUT", indexMapping);
  console.log("Index created successfully:", result);
}

// 批量插入数据
async function bulkInsert(data: any[]) {
  console.log(`Inserting ${data.length} documents...`);

  // 准备bulk请求体
  const bulkBody = [];
  for (const doc of data) {
    bulkBody.push({
      index: {
        _index: INDEX_NAME,
        _id: doc.id
      }
    });
    bulkBody.push(doc);
  }

  // 将bulk请求体转换为字符串（每行一个JSON对象）
  const bulkBodyString = bulkBody.map((item) => JSON.stringify(item)).join("\n") + "\n";

  try {
    const response = await fetch(`${ES_HOST}/_bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: bulkBodyString
    });

    if (!response.ok) {
      throw new Error(`Bulk insert failed: ${response.status} - ${await response.text()}`);
    }

    const result = await response.json();

    // 检查是否有错误
    if (result.errors) {
      console.error(
        "Bulk insert errors:",
        result.items.filter((item) => item.index.error)
      );
    } else {
      console.log("All documents inserted successfully");
    }
  } catch (error) {
    console.error("Bulk insert failed:", error);
    throw error;
  }
}

// 主函数
async function main() {
  try {
    console.log("Starting ES index creation and data insertion...");

    // 检查ES连接
    console.log("Checking ES connection...");
    await makeRequest(ES_HOST, "GET");
    console.log("Connected to ES successfully");

    // 检查ES版本
    const info = await makeRequest(ES_HOST, "GET");
    console.log(`ES Version: ${info.version.number}`);

    // 验证版本兼容性
    if (info.version.number.startsWith("7.")) {
      console.log("ES version is compatible (7.x)");
    } else {
      console.warn(`ES version ${info.version.number} may not be compatible with this script`);
    }

    // 删除现有索引（如果存在）
    await deleteIndex();

    // 创建新索引
    await createIndex();

    // 生成测试数据
    console.log("Generating test data...");
    const testData = generateTestData(1000);

    // 验证生成的数据精度
    console.log("Sample of high precision coordinates:");
    for (let i = 0; i < 5; i++) {
      const sample = testData[i];
      console.log(`  ${sample.name}: lat=${sample.latitude}, lon=${sample.longitude}`);
      console.log(
        `    Lat precision: ${(sample.latitude.toString().split(".")[1] || "").length} decimal places`
      );
      console.log(
        `    Lon precision: ${(sample.longitude.toString().split(".")[1] || "").length} decimal places`
      );
    }

    // 批量插入数据
    await bulkInsert(testData);

    console.log("Index creation and data insertion completed successfully!");
    console.log(`Index "${INDEX_NAME}" now contains ${testData.length} documents`);

    // 验证数据插入
    console.log("Verifying data...");
    const countResponse = await makeRequest(`${ES_HOST}/${INDEX_NAME}/_count`, "GET");
    console.log(`Total documents in index: ${countResponse.count}`);

    // 查询一条数据验证
    const searchResponse = await makeRequest(`${ES_HOST}/${INDEX_NAME}/_search`, "POST", {
      query: {
        match_all: {}
      },
      size: 1
    });

    if (searchResponse.hits.hits.length > 0) {
      console.log("Sample document:", JSON.stringify(searchResponse.hits.hits[0]._source, null, 2));
    }

    // 执行地理查询验证geo_point字段
    console.log("Testing geo_point functionality...");
    const geoQuery = {
      query: {
        bool: {
          must: [
            {
              geo_distance: {
                distance: "100km",
                location: {
                  lat: 39.9042123456789, // 北京坐标，高精度
                  lon: 116.4074123456789
                }
              }
            }
          ]
        }
      },
      size: 5
    };

    const geoResponse = await makeRequest(`${ES_HOST}/${INDEX_NAME}/_search`, "POST", geoQuery);
    console.log(
      `Geo distance query found ${geoResponse.hits.hits.length} results within 100km of Beijing`
    );
  } catch (error) {
    console.error("Script failed:", error);
    process.exit(1);
  }
}

// 运行主函数
await main();
