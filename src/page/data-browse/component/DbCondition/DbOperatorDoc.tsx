import { DrawerPlugin, Paragraph } from "tdesign-vue-next";

export function openDbOperatorDoc() {
  DrawerPlugin({
    header: "数据浏览操作文档",
    placement: "right",
    size: "600px",
    footer: false,
    default: () => (
      <div class="p-4 space-y-4">
        <div class="text-lg font-bold">概览</div>
        <Paragraph>
          数据浏览用于在指定索引中进行快速检索，并将 Elasticsearch 的搜索结果以表格形式展示。
          条件输入区分为三类：<code>MUST</code>、<code>SHOULD</code>、<code>MUST_NOT</code>
          ，以及一个排序区
          <code>ORDER</code>。每一类条件都支持多条，使用英文逗号分隔。
        </Paragraph>

        <div class="text-lg font-bold">条件语法</div>
        <Paragraph>
          条件的基本格式为：<code>字段 操作符 值</code>，多条以逗号分隔。例如：
          <code>status = 'success', age &gt;= 18, active = true</code>
          。字符串建议使用单引号包裹，数字与布尔值无需引号； 逗号后可有空格。
        </Paragraph>

        <div class="text-lg font-bold">MUST（必须匹配）</div>
        <Paragraph>
          所有 <code>MUST</code> 条件必须同时满足，等价于 Elasticsearch 的 <code>bool.must</code>。
          适用于严格筛选，例如：<code>status = 'success', amount &gt;= 100</code>。
        </Paragraph>

        <div class="text-lg font-bold">SHOULD（应当匹配）</div>
        <Paragraph>
          至少满足其中任意一条，等价于 <code>bool.should</code>。与 <code>MUST</code> 联合使用时，
          <code>SHOULD</code> 会影响相关性评分；仅使用 <code>SHOULD</code>{" "}
          时，满足任意条件即可被检索到。 例如：<code>channel match 'web', channel match 'ios'</code>
          。
        </Paragraph>

        <div class="text-lg font-bold">MUST_NOT（必须不匹配）</div>
        <Paragraph>
          用于排除不希望出现的记录，等价于 <code>bool.must_not</code>。例如：
          <code>status = 'deleted'</code> 或 <code>level = 'debug'</code>（排除调试日志）。
        </Paragraph>

        <div class="text-lg font-bold">ORDER（排序）</div>
        <Paragraph>
          排序格式为：<code>字段 asc|desc</code>，多条以逗号分隔。例如：
          <code>@timestamp desc, level asc</code>。当存在多个排序条件时，按顺序依次生效。
        </Paragraph>

        <div class="text-lg font-bold">支持的操作符</div>
        <div>
          <div class="font-bold">输入框支持的简洁语法：</div>
          <ul class="list-disc pl-4 space-y-2">
            <li>
              <code>=</code> / <code>eq</code>：精确匹配，映射为 <code>term</code>
            </li>
            <li>
              <code>!=</code> / <code>ne</code>：排除匹配，映射为 <code>bool.must_not.term</code>
            </li>
            <li>
              <code>&gt;</code> / <code>&gt;=</code> / <code>&lt;</code> / <code>&lt;=</code> 或{" "}
              <code>gt</code>/<code>gte</code>/<code>lt</code>/<code>lte</code>：范围查询，映射为{" "}
              <code>range</code>
            </li>
            <li>
              <code>like</code>：模糊匹配，映射为 <code>wildcard</code>，示例：
              <code>name like 'abc'</code>
            </li>
            <li>
              <code>match</code>：全文匹配（文本字段）
            </li>
            <li>
              <code>term</code>：精确匹配（keyword/数值/布尔）
            </li>
            <li>
              <code>exists</code>：字段存在判断（可不带值），示例：<code>field exists</code>
            </li>
            <li>
              <code>missing</code>：字段缺失判断（可不带值），示例：<code>field missing</code>
              （内部映射为 <code>bool.must_not.exists</code>）
            </li>
            <li>
              <code>in</code>：多值匹配，映射为 <code>terms</code>，示例：<code>tag in a,b,c</code>
            </li>
          </ul>
          <Paragraph class="text-gray">
            以上操作符均在数据浏览输入框与查询构建器中支持；请参考示例规范书写。
          </Paragraph>
        </div>

        <div class="text-lg font-bold">示例</div>
        <ul class="list-disc pl-4 space-y-2">
          <li>
            <span class="font-bold">MUST：</span>
            <code>status = 'success', amount &gt;= 100, active = true</code>
          </li>
          <li>
            <span class="font-bold">SHOULD：</span>
            <code>title match 'Elasticsearch', title match 'ES'</code>
          </li>
          <li>
            <span class="font-bold">MUST_NOT：</span>
            <code>level = 'debug'</code>
          </li>
          <li>
            <span class="font-bold">ORDER：</span>
            <code>@timestamp desc, level asc</code>
          </li>
        </ul>

        <div class="text-lg font-bold">使用提示</div>
        <ul class="list-disc pl-4 space-y-2">
          <li>多条条件用英文逗号分隔，逗号后允许空格。</li>
          <li>
            字符串建议使用单引号，例如 <code>'中文'</code>；数字与布尔值（<code>true</code>/
            <code>false</code>）无需引号。
          </li>
          <li>回车执行查询；清空输入框也会触发刷新。</li>
        </ul>
      </div>
    )
  });
}
