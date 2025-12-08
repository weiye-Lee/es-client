// sql-parser.ts
import moo from 'moo';

// ========================
// 1. Token 定义
// ========================
const lexer = moo.compile({
  // 空白和注释（跳过）
  ws: { match: /[ \t\r\n]+/, lineBreaks: true }, // 👈 关键：加上 lineBreaks: true
  comment: /\/\/.*?$/,

  // 括号与标点
  lparen: '(',
  rparen: ')',
  comma: ',',
  dot: '.',

  // 关键字（大小写不敏感，但保留原始值）
  select: 'SELECT',
  from: 'FROM',
  where: 'WHERE',
  as: 'AS',
  term: 'TERM',
  match: 'MATCH',
  order: 'ORDER',
  by: 'BY',
  limit: 'LIMIT',
  offset: 'OFFSET',
  // 排序方向
  asc: 'ASC',
  desc: 'DESC',
  is: 'IS',
  not: 'NOT',
  null: 'NULL',
  like: 'LIKE',
  and: 'AND',
  or: 'OR',

  // 操作符（优先匹配长串）
  lte: '<=',
  gte: '>=',
  neq: ['!=', '<>'],
  lt: '<',
  gt: '>',
  eq: '=',

  // 字面量
  string: /'(?:\\['\\]|[^'\n\\])*'/,
  number: /\d+(?:\.\d+)?/,

  // 标识符：普通字段名
  ident: /[a-zA-Z_][a-zA-Z0-9_]*/,

  // 反引号标识符（支持空格、特殊字符）
  backtick: /`(?:\\[`\\]|[^`\n\\])*`/,
});

// ========================
// 2. AST 节点类型
// ========================
export type Expr =
  | { type: 'Identifier'; name: string }
  | { type: 'StringLiteral'; value: string }
  | { type: 'NumberLiteral'; value: number }
  | { type: 'FunctionCall'; name: string; args: Expr[] };

export type SelectItem = {
  expr: Expr;
  alias: string;
};

export type Condition =
  | { type: 'BinaryOp'; op: string; left: Expr; right: Expr }
  | { type: 'IsNull'; expr: Expr; not: boolean }
  | { type: 'Like'; expr: Expr; pattern: string }
  | { type: 'LogicalOp'; op: 'AND' | 'OR'; left: Condition; right: Condition }
  | { type: 'Paren'; condition: Condition };

export type OrderBy = {
  field: string;
  direction: 'ASC' | 'DESC';
};

export type Query = {
  select: SelectItem[];
  from: string;
  where?: Condition;
  orderBy?: OrderBy[];
  limit?: number;
  offset?: number;
};

// ========================
// 3. Parser
// ========================
export class SQLParser {
  private tokens: moo.Token[];
  private pos = 0;
  private eofToken: moo.Token = {
    type: 'EOF',
    value: '',
    offset: 0,
    line: 0,
    col: 0,
    toString() { return 'EOF'; }
  } as moo.Token;

  constructor(input: string) {
    lexer.reset(input);
    this.tokens = Array.from(lexer);
    // 移除 ws 和 comment
    this.tokens = this.tokens.filter(t => t.type !== 'ws' && t.type !== 'comment');
  }

  private peek(offset = 0): moo.Token {
    return this.tokens[this.pos + offset] || this.eofToken;
  }

  private consume(expectedType?: string): moo.Token {
    const token = this.tokens[this.pos++];
    if (!token) throw new Error('Unexpected end of input');
    if (expectedType && token.type !== expectedType) {
      throw new Error(`Expected token ${expectedType}, got ${token.type} ("${token.value}")`);
    }
    return token;
  }

  parse(): Query {
    this.consume('select');
    const selectItems = this.parseSelectList();
    this.consume('from');
    const from = this.parseTableName();

    let where: Condition | undefined;
    let orderBy: OrderBy[] | undefined;
    let limit: number | undefined;
    let offset: number | undefined;

    // WHERE
    if (this.peek().type === 'where') {
      this.consume('where');
      where = this.parseCondition();
    }

    // ORDER BY
    if (this.peek().type === 'order') {
      this.consume('order');
      this.consume('by');
      orderBy = [];
      do {
        const field = this.parseFieldName();
        let direction: 'ASC' | 'DESC' = 'ASC';
        if (this.peek().type === 'asc') {
          this.consume('asc');
          direction = 'ASC';
        } else if (this.peek().type === 'desc') {
          this.consume('desc');
          direction = 'DESC';
        }
        orderBy.push({ field, direction });
      } while (this.peek().type === 'comma' && this.consume('comma'));
    }

    // LIMIT
    if (this.peek().type === 'limit') {
      this.consume('limit');
      limit = Number(this.consume('number').value);
      if (this.peek().type === 'offset') {
        this.consume('offset');
        offset = Number(this.consume('number').value);
      }
    }

    return { select: selectItems, from, where, orderBy, limit, offset };
  }

  private parseSelectList(): SelectItem[] {
    const items: SelectItem[] = [];
    do {
      const expr = this.parseExpr();
      let alias = this.getDefaultAlias(expr);
      if (this.peek().type === 'as') {
        this.consume('as');
        alias = this.parseAlias();
      }
      items.push({ expr, alias });
    } while (this.peek().type === 'comma' && this.consume('comma'));
    return items;
  }

  private parseExpr(): Expr {
    // 反引号字段
    if (this.peek().type === 'backtick') {
      const raw = this.consume('backtick').value;
      return { type: 'Identifier', name: raw.slice(1, -1) };
    }

    // 普通标识符
    if (this.peek().type === 'ident') {
      const ident = this.consume('ident').value;
      // 检查是否是函数调用
      if (this.peek().type === 'lparen') {
        this.consume('lparen');
        const args: Expr[] = [];
        if (this.peek().type !== 'rparen') {
          do {
            args.push(this.parseExpr());
          } while (this.peek().type === 'comma' && this.consume('comma'));
        }
        this.consume('rparen');
        return { type: 'FunctionCall', name: ident.toUpperCase(), args };
      }
      return { type: 'Identifier', name: ident };
    }

    // 字符串字面量
    if (this.peek().type === 'string') {
      const raw = this.consume('string').value;
      return { type: 'StringLiteral', value: raw.slice(1, -1) };
    }

    // 数字字面量
    if (this.peek().type === 'number') {
      const numStr = this.consume('number').value;
      return { type: 'NumberLiteral', value: Number(numStr) };
    }

    throw new Error(`Unexpected token in expression: ${this.peek().type}`);
  }

  private getDefaultAlias(expr: Expr): string {
    if (expr.type === 'Identifier') return expr.name;
    if (expr.type === 'FunctionCall') {
      const argsStr = expr.args.map(a => this.formatExprArg(a)).join(', ');
      return `${expr.name}(${argsStr})`;
    }
    return 'expr';
  }

  private formatExprArg(a: Expr): string {
    switch (a.type) {
      case 'StringLiteral':
        return `'${a.value}'`;
      case 'NumberLiteral':
        return String(a.value);
      case 'Identifier':
        return a.name;
      case 'FunctionCall':
        return `${a.name}(${a.args.map(x => this.formatExprArg(x)).join(', ')})`;
    }
  }

  private parseAlias(): string {
    if (this.peek().type === 'backtick') {
      const raw = this.consume('backtick').value;
      return raw.slice(1, -1);
    }
    if (this.peek().type === 'ident') {
      return this.consume('ident').value;
    }
    throw new Error('Expected alias after AS');
  }

  private parseFieldName(): string {
    if (this.peek().type === 'backtick') {
      const raw = this.consume('backtick').value;
      return raw.slice(1, -1);
    }
    if (this.peek().type === 'ident') {
      return this.consume('ident').value;
    }
    throw new Error('Expected field name');
  }

  private parseTableName(): string {
    return this.parseFieldName(); // same as field name
  }

  // ========================
  // 条件解析（核心：支持 AND/OR/括号）
  // ========================
  private parseCondition(): Condition {
    return this.parseLogicalOr();
  }

  private parseLogicalOr(): Condition {
    let left = this.parseLogicalAnd();
    while (this.peek().type === 'or') {
      this.consume('or');
      const right = this.parseLogicalAnd();
      left = { type: 'LogicalOp', op: 'OR', left, right };
    }
    return left;
  }

  private parseLogicalAnd(): Condition {
    let left = this.parseComparison();
    while (this.peek().type === 'and') {
      this.consume('and');
      const right = this.parseComparison();
      left = { type: 'LogicalOp', op: 'AND', left, right };
    }
    return left;
  }

  private parseComparison(): Condition {
    // 处理括号 ( ... )
    if (this.peek().type === 'lparen') {
      this.consume('lparen');
      const cond = this.parseCondition();
      this.consume('rparen');
      return { type: 'Paren', condition: cond };
    }

    const expr = this.parseExpr();

    // IS [NOT] NULL
    if (this.peek().type === 'is') {
      this.consume('is');
      const not = this.peek().type === 'not';
      if (not) this.consume('not');
      this.consume('null');
      return { type: 'IsNull', expr, not };
    }

    // LIKE
    if (this.peek().type === 'like') {
      this.consume('like');
      const patternToken = this.consume('string');
      const pattern = patternToken.value.slice(1, -1);
      return { type: 'Like', expr, pattern };
    }

    // 操作符: =, !=, <, <=, >, >=, TERM, MATCH
    const opToken = this.peek();
    const opMap: Record<string, string> = {
      eq: '=',
      neq: '!=',
      lt: '<',
      lte: '<=',
      gt: '>',
      gte: '>=',
      term: 'TERM',
      match: 'MATCH',
    };

    const t = opToken.type as keyof typeof opMap | undefined;
    if (t && opMap[t]) {
      this.consume(t as string);
      const right = this.parseExpr();
      return { type: 'BinaryOp', op: opMap[t], left: expr, right };
    }

    throw new Error(`Expected operator after expression, got ${opToken.type}`);
  }
}

// ========================
// 4. 使用示例 & DSL 生成（简化版）
// ========================
export function parseSQL(sql: string): Query {
  const parser = new SQLParser(sql);
  return parser.parse();
}

// 示例：将 WHERE 条件转为 ES bool 查询（简化）
export function conditionToES(cond: Condition): any {
  switch (cond.type) {
    case 'LogicalOp':
      if (cond.op === 'AND') {
        return {
          bool: {
            must: [conditionToES(cond.left), conditionToES(cond.right)],
          },
        };
      } else {
        return {
          bool: {
            should: [conditionToES(cond.left), conditionToES(cond.right)],
            minimum_should_match: 1,
          },
        };
      }

    case 'Paren':
      return conditionToES(cond.condition);

    case 'BinaryOp':
      const field = getIdentifierName(cond.left);
      const value = getComparableValue(cond.right);
      if (cond.op === '=' || cond.op === 'TERM') {
        return { term: { [field]: value } };
      } else if (cond.op === 'MATCH') {
        return { match: { [field]: value } };
      } else if (cond.op === '!=') {
        return { bool: { must_not: { term: { [field]: value } } } };
      } else if (cond.op === '<') {
        return { range: { [field]: { lt: value } } };
      } else if (cond.op === '<=') {
        return { range: { [field]: { lte: value } } };
      } else if (cond.op === '>') {
        return { range: { [field]: { gt: value } } };
      } else if (cond.op === '>=') {
        return { range: { [field]: { gte: value } } };
      }
      // 其他操作符可扩展
      throw new Error(`Unsupported op: ${cond.op}`);

    case 'IsNull':
      const nullField = getIdentifierName(cond.expr);
      if (cond.not) {
        return { exists: { field: nullField } };
      } else {
        return { bool: { must_not: { exists: { field: nullField } } } };
      }

    case 'Like':
      return { wildcard: { [getIdentifierName(cond.expr)]: cond.pattern.replace(/%/g, '*') } };

    default:
      throw new Error('Unknown condition type');
  }
}

function getIdentifierName(expr: Expr): string {
  if (expr.type === 'Identifier') return expr.name;
  throw new Error('Field must be identifier');
}

function getComparableValue(expr: Expr): string | number {
  switch (expr.type) {
    case 'StringLiteral':
      return expr.value;
    case 'NumberLiteral':
      return expr.value;
    case 'Identifier':
      return expr.name;
    default:
      throw new Error('Right value must be literal or identifier');
  }
}
