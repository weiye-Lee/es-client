import * as monaco from 'monaco-editor';

export const esSqlLanguage: monaco.languages.IMonarchLanguage = {
  ignoreCase: true,

  // 自定义 token 类型（用于主题着色）
  tokenPostfix: '.sql',

  // 关键字
  keywords: [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'AS', 'ORDER', 'BY',
    'LIMIT', 'OFFSET', 'IS', 'NOT', 'NULL', 'LIKE', 'TERM', 'MATCH'
  ],

  // 函数名列表（用于识别）
  functions: ['CONCAT', 'DATE_FORMAT'],

  // 操作符
  operators: ['=', '!=', '<>', '<', '<=', '>', '>=', '+', '-', '*', '/'],

  brackets: [
    { open: '(', close: ')', token: 'delimiter.parenthesis' }
  ],

  autoClosingPairs: [
    { open: '(', close: ')' },
    { open: "'", close: "'", notIn: ['string'] },
    { open: '`', close: '`', notIn: ['string'] }
  ],

  tokenizer: {
    root: [
      [/[ \t\r\n]+/, ''],
      [/\/\/.*$/, 'comment'],
      [/'(?:[^'\\]|\\.)*'/, 'string'],
      [/`(?:[^`\\]|\\.)*`/, 'identifier.backtick'],
      [/\d+(\.\d+)?/, 'number'],
      [/\(|\)/, '@brackets'],
      [/,/, 'delimiter'],
      [/;/, 'delimiter.semicolon'], // 分号单独处理
      [/[\.\*\/\+\-]/, 'operator'],
      [/!=|<=|>=|<>/, 'operator'],
      [/=|<|>/, 'operator'],

      // 特殊处理函数：进入函数上下文
      [/CONCAT(?=\s*\()/, { token: 'function.concat', next: '@concatArgs' }],
      [/DATE_FORMAT(?=\s*\()/, { token: 'function.date_format', next: '@dateFormatArgs' }],

      // 普通关键字和标识符
      [
        /[A-Za-z_][A-Za-z0-9_]*/,
        {
          cases: {
            '@keywords': 'keyword',
            '@functions': 'function',
            '@default': 'identifier'
          }
        }
      ]
    ],

    // CONCAT 参数上下文
    concatArgs: [
      [/[^(),'\s`]+/, 'identifier'], // 普通字段/数字
      [/'(?:[^'\\]|\\.)*'/, 'string'],
      [/`(?:[^`\\]|\\.)*`/, 'identifier.backtick'],
      [/\d+(\.\d+)?/, 'number'],
      [/,/, 'delimiter'],
      [/\)/, { token: '@brackets', next: '@pop' }], // 结束函数，返回 root
      [/\(/, '@brackets'], // 允许嵌套 (但不跟踪深度)
      [/[ \t\r\n]+/, '']
    ],

    // DATE_FORMAT 参数上下文（第二个参数视为 format）
    dateFormatArgs: [
      // 第一个参数：字段（普通标识符）
      [/[^(),'\s`]+/, { token: 'identifier', next: '@dateFormatFormat' }],
      [/`(?:[^`\\]|\\.)*`/, { token: 'identifier.backtick', next: '@dateFormatFormat' }],
      [/'(?:[^'\\]|\\.)*'/, { token: 'string', next: '@dateFormatFormat' }], // 虽不合理，但容错
      [/\d+(\.\d+)?/, { token: 'number', next: '@dateFormatFormat' }],

      // 如果直接是 ), 说明无第二个参数
      [/\)/, { token: '@brackets', next: '@pop' }],

      [/[ \t\r\n]+/, '']
    ],

    // DATE_FORMAT 的第二个参数（格式字符串）
    dateFormatFormat: [
      [/,/, 'delimiter'],
      [/'(?:[^'\\]|\\.)*'/, 'string.format'],
      [/\)/, { token: '@brackets', next: '@popall' }],
      [/[^(),'\s`]+/, 'invalid'],
      [/[ \t\r\n]+/, '']
    ]
  },

  folding: {
    markers: {
      start: new RegExp('^\\s*--\\s*region\\b', 'i'),
      end: new RegExp('^\\s*--\\s*endregion\\b', 'i')
    }
  }
};
