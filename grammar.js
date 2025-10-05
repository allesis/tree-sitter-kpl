/**
 * @file KPL grammer for tree-sitter
 * @author Sean Allesina-McGrory <SeanAllesina@proton.me>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const dataTypes = [
  'int',
  'double',
  'char',
  'bool',
];

module.exports = grammar({
  name: "kpl",

  rules: {
    source_file: $ => choice(
      $.header_file,
      $.code_file,
    ),

    identifier: _ => /[a-zA-Z_]+/,
    integer: _ => /\d+/,
    double: _ => /\d+\.\d+/,
    char: _ => /[a-zA-Z]/,
    string: $ => repeat($.char),
    operator: _ => choice(
      '||',
      '&&',
      '|',
      '^',
      '&',
      '==',
      '!=',
      '<',
      '<=',
      '>',
      '>=',
    ),

    number: $ => choice(
      $.integer,
      $.double,
    ),

    assignment_statement: $ => seq(
      $.identifier,
      '=',
      $.expression,
    ),

    type: $ => choice(
      'char',
      'int',
      'double',
      'bool',
      'void',
      'typeOfNull',
      'anyType',
    ),

    named_type: $ => seq(
      $.identifier,
      optional(seq(
        '[',
          $.type,
          repeat(seq(',', $.type)),
        ']',
      )),
    ),

    type_list: $ => seq(
      $.named_type,
      repeat(seq(',', $.named_type)),
    ),

    dimension: $ => choice(
      '*',
      $.expression,
    ),

    constructor: $ => choice(
      seq($.type, $.class_record_init),
      seq($.type, $.array_init),
      $.type,
    ),

    class_record_init: $ => seq(
      $.identifier,
      '{',
      $.identifier,
      '=',
      $.expression,
      repeat(seq(
        ',',
        $.identifier,
        '=',
        $.expression,
      )),
      '}',
    ),

    array_init: $ => seq(
      $.identifier,
      '{',
      optional(seq($.expression, 'of',)),
      $.expression,
      repeat(seq(
        ',', 
        optional(seq($.expression, 'of',)),
        $.expression,
      )),
      '}',
    ),

    constants: $ => seq(
      'const',
      $.assignment_statement,
      repeat($.assignment_statement),
    ),

    declaration: $ => seq(
      $.identifier,
      repeat(seq(',', $.identifier)),
      ':',
      $.type,
    ),

    variable_declaration: $ => seq(
      $.declaration,
      optional(seq('=', $.expr2)),
    ),

    variable_declarations: $ => seq(
      'var',
      $.variable_declaration,
      repeat($.variable_declaration),
    ),

    errors: $ => seq(
      'errors',
      seq($.identifier, $.parameter_list),
      repeat(seq($.identifier, $.parameter_list)),
    ),

    statement: $ => choice(
      $.if_statement,
      $.variable_assignment,
      $.id_arglist,
      seq(
        $.expression,
        $.identifier,
        ':',
        $.expression,
        repeat(seq(
          $.identifier,
          ':',
          $.expression,
        )),
      ),
      seq(
        $.expression,
        '.',
        $.identifier,
        $.arg_list,
      ),
      $.while_loop,
      $.until_loop,
      'break',
      'continue',
      $.return_statement,
      $.for_loop,
      $.for_loop,
      $.switch_statement,
      $.try_statement,
      $.throw_statement,
      $.free_statement,
      'debug',
    ),

    if_statement: $ => seq(
      'if',
      $.expression,
      $.statement_list,
      repeat(seq('elseIf', $.expression, $.statement_list)),
      optional(seq('else', $.statement_list)),
      'endIf',
    ),

    l_value: $ => $.expression,

    variable_assignment: $ => seq(
      $.l_value,
      '=',
      $.expression,
    ),

    id_arglist: $ => seq(
      $.identifier,
      $.arg_list,
    ),

    while_loop: $ => seq(
      'while',
      $.expression,
      $.statement_list,
      'endWhile',
    ),

    until_loop: $ => seq(
      'do',
      $.statement_list,
      'until',
      $.expression,
    ),

    for_loop: $ => choice(
      $._kpl_for_loop,
      $._c_for_loop,
    ),

    _kpl_for_loop: $ => seq(
      'for',
      $.l_value,
      '=',
      $.expression,
      'to',
      $.expression,
      optional(seq('by', $.expression)),
      $.statement_list,
      'endFor',
    ),

      _c_for_loop: $ => seq(
      'for',
      '(',
        $.statement_list,
        ';',
        optional($.expression),
        $.statement_list,
      ')',
      $.statement_list,
        'endFor',
    ),

    switch_statement: $ => seq(
      'switch',
      repeat(seq('case', $.expression, ':', $.statement_list)),
      optional(seq('default', ':', $.statement_list)),
      'endSwitch',
    ),

    try_statement: $ => seq(
      'try',
      $.statement_list,
      $._catch_statement,
      repeat($._catch_statement),
      'endTry',
    ),

    _catch_statement: $ => seq(
      'catch',
      $.identifier,
      $.parameter_list,
      ':',
      $.statement_list,
    ),

    throw_statement: $ => seq(
      'throw',
      $.identifier,
      $.arg_list,
    ),

    free_statement: $ => seq(
      'free',
      $.expression,
    ),

    method_definition: $ => seq(
      'method',
      $.method_prototype,
      optional($.variable_definition),
      repeat($.statement),
      'endMethod',
    ),

    methods_definition: $ => seq(
      'methods',
      $.method_prototype,
      repeat($.method_prototype),
    ),
    
    type_parameters: $ => seq(
      '[',
      $.type,
      repeat(seq(',', $.type)),
      ']',
    ),
    
    renaming_statement: $ => seq(
      'renaming',
      $.rename_statement,
      repeat(seq(',', $.renaming_statement)),
    ),

    package_id: $ => seq(
      $.identifier,
      optional($.renaming_statement),
    ),
    
    package_string: $ => seq(
      $.string,
      optional($.renaming_statement),
    ),
    other_package: $ => choice(
      $.package_id,
      $.package_string,
    ),

    rename_statement: $ => seq(
      $.identifier,
      'to',
      $.identifier,
    ),

    uses_statement: $ => seq(
      'uses',
      $.other_package,
      repeat(seq(',', $.other_package)),
    ),

    constant_definition: $ => seq(
      'const',
      repeat(seq(
        $.identifier,
        /\s=\s/,
        $.number,
      ))
    ),

    variable_statement: $ => seq(
      repeat(seq($.identifier, ',')),
      $.identifier
    ),

    variable_definition: $ => seq(
      'var',
      repeat($.variable_statement),
    ),

    type_identifier: $ => seq(
      $.identifier,
      ':',
      $.type,
    ),

    type_definition: $ => seq(
      'type',
      seq($.identifier, '=', $.type),
      repeat(seq($.identifier, '=', $.type)),
    ),

    enum: $ => seq(
      'enum',
      $.identifier, 
      optional(seq('=', $.expression)),
      repeat(seq(',', $.identifier)),
    ),

    arg_list: $ => choice(
      seq('(', ')'),
      seq(
        $.expression,
        repeat(seq(',', $.expression)),
      ),
    ),

    parameter_list: $ => choice(
      seq('(', ')'),
      seq(
        $.declaration,
        repeat(seq(',', $.declaration)),
      ),
    ),

    identifier_list: $ => seq(
      $.identifier,
      repeat(seq(',', $.identifier)),
    ),

    error_definition: _ => seq(
      'error_def',
    ),

    enumeration: _ => seq(
      'enum',
    ),

    function_prototype: $ => seq(
      $.identifier,
      $.parameter_list,
      optional($.return_statement),
    ),

    functions_prototype: $ => seq(
      optional('external'),
      $.function_prototype,
    ),

    functions_prototypes: $ => seq(
    'functions',
    $.functions_prototype,
      repeat($.functions_prototype),
    ),

    return_definition: $ => seq(
      'returns',
      $.type_definition,
    ),

    parameters_definition: $ => seq(
      $.identifier,
      $.parameter_list,
      optional($.return_statement),
    ),

    infix_definition: $ => seq(
      'infix',
      $.operator,
      '(',
      $.identifier,
      ':',
      $.type_definition,
      ')',
      $.return_definition,
    ),

    prefix_definition: $ => seq(
      'prefix',
      $.operator,
      '(',
      ')',
      'returns',
      $.type_definition,
    ),

    identifier_definition: $ => seq(
      $.identifier,
      ':',
      '(',
      $.identifier,
      ':',
      $.type_definition,
      ')',
    ),

    identifiers_definition: $ => seq(
      $.identifier_definition,
      repeat($.identifier_definition),
      optional($.return_definition),
    ),

    method_prototype: $ => choice(
      $.parameters_definition,
      $.infix_definition,
      $.prefix_definition,
      $.identifiers_definition,
    ),

    messages_definition: $ => seq(
      'messages',
      $.method_prototype,
      repeat($.method_prototype),
    ),

    extends_definition: $ => seq(
      'extends',
      repeat(seq($.identifier,',')),
      $.identifier,
    ),

    interface: $ => seq(
      'interface',
      $.identifier,
      optional($.type_parameters),
      optional($.extends_definition),
      optional($.messages_definition),
      'endInterface',
    ),

    interface_definition: $ => seq(
      'interface',
      $.identifier,
      optional($.type_parameters),
      $.interface,
      'endInterface'
    ),

    function: $ => seq(
      'function',
      $.identifier,
      $.parameter_list,
      $.return_definition,
      optional($.variable_declaration),
      $.statement_list,
      'endFunction',
    ),

    nameless_function: $ => seq(
      'function',
      $.parameter_list,
      $.return_definition,
      optional($.variable_declaration),
      $.statement_list,
      'endFunction',
    ),

    function_definition: $ => seq(
      'function',
      $.identifier,
      optional($.type_definition),
      $.function,
      'endFunction'
    ),

    class: $ => seq(
      'class',
      $.identifier,
      optional($.type_parameters),
      optional($.implementation_definition),
      optional($.superclass_definition),
      optional($.fields_definition),
      optional($.extends_definition),
      'endClass',
    ),

    class_definition: $ => seq(
      'class',
      $.identifier,
      optional($.type_definition),
      $.class,
      'endClass',
    ),

    behavior_definition: $ => seq(
      'behavior',
      $.identifier,
      optional($.method),
      'endBehavior',
    ),

    method: $ => seq(
      'method',
      $.method_prototype,
      $.variable_declaration,
      $.statement_list,
      'endMethod',
    ),

    statement_list: $ => repeat($.statement),

    block: $ => seq(
      '{',
      repeat($.statement),
      '}'
    ),

    return_statement: $ => seq(
      'return',
      optional($.expression),
    ),

    expression: $ => seq(
      $.expression2,
      repeat(seq($.identifier, ':', $.expression2)),
    ),

    expression2: $ => seq(
      $.expression3,
      repeat(seq(
        $.operator,
        $.expression3
      )),
    ),

    expression3: $ => seq(
      $.expression5,
      repeat(seq(
        '||',
        $.expression5
      )),
    ),

    expression5: $ => seq(
      $.expression6,
      repeat(seq(
        '&&',
        $.expression6,
      )),
    ),

    expression6: $ => seq(
      $.expression7,
      repeat(seq(
        '|',
        $.expression7,
      )),
    ),

    expression7: $ => seq(
      $.expression8,
      repeat(seq(
        '^',
        $.expression8,
      )),
    ),

    expression8: $ => seq(
      $.expression9,
      repeat(seq(
        '&',
        $.expression9,
      )),
    ),

    expression9: $ => choice(
      seq(
        $.expression10,
        repeat(seq(
          '==',
          $.expression10,
        ))
      ),
      seq(
        $.expression10,
        repeat(seq(
          '!=',
          $.expression10,
        ))
      ),
    ),

    expression10: $ => choice(
      seq(
        $.expression11,
        repeat(seq(
          '<',
         $.expression11,
        ))
      ),
      seq(
        $.expression11,
        repeat(seq(
          '<=',
          $.expression11,
        ))
      ),
      seq(
        $.expression11,
        repeat(seq(
          '>',
          $.expression11,
        ))
      ),
      seq(
        $.expression11,
        repeat(seq(
          '>=',
          $.expression11,
        ))
      ),
    ),

    expression11: $ => choice(
      seq(
        $.expression12,
        repeat(seq(
          '<<',
          $.expression12,
        ))
      ),
      seq(
        $.expression12,
        repeat(seq(
          '>>',
          $.expression12,
        ))
      ),
      seq(
        $.expression12,
        repeat(seq(
          '>>>',
          $.expression12,
        ))
      ),
    ),

    expression12: $ => choice(
      seq(
        $.expression13,
        repeat(seq(
          '+',
          $.expression13,
        ))
      ),
      seq(
        $.expression13,
        repeat(seq(
          '-',
          $.expression13,
        ))
      ),
    ),

    expression13: $ => choice(
      seq(
        $.expression15,
        repeat(seq(
          '*',
          $.expression15,
        ))
      ),
      seq(
        $.expression15,
        repeat(seq(
          '/',
          $.expression15,
        ))
      ),
      seq(
        $.expression15,
        repeat(seq(
          '%',
          $.expression15,
        ))
      ),
    ),

    expression15: $ => choice(
      seq(
        $.operator,
        $.expression15
      ),
      $.expression16,
    ),

    expression16: $ => seq(
      $.expression17,
      repeat(choice(
        seq('.', $.identifier, $.arg_list),
        seq('.', $.identifier),
        seq('asPtrTo', $.type),
        'asInteger',
        'arraySize',
        seq('isInstanceOf', $.type),
        seq('isKindOf', $.type),
        seq('[', $.expression, repeat(seq(',', $.expression)), ']'),
      ))
    ),

    expression17: $ => choice(
      seq('(', $.expression, ')'),
      'null',
      'true',
      'false',
      'self',
      'super',
      $.integer,
      $.double,
      $.char,
      $.string,
      $.nameless_function,
      $.identifier,
      seq($.identifier, $.arg_list),
      seq('new', $.constructor),
      seq('alloc', $.constructor),
      seq('sizeOf', $.type),
    ),

    header_statment: $ => choice(
      $.constant_definition,
      $.error_definition,
      $.variable_definition,
      $.enumeration,
      $.type_definition,
      $.function_prototype,
      $.interface_definition,
      $.class_definition,
    ),

    code_statement: $ => choice(
      $.constant_definition,
      $.error_definition,
      $.variable_definition,
      $.enumeration,
      $.type_definition,
      $.function_definition,
      $.interface_definition,
      $.class_definition,
      $.behavior_definition,
    ),

    header_file: $ => seq(
      'header',
      $.identifier,
      optional(repeat($.uses_statement)),
      repeat($.header_statment),
      'endHeader',
    ),

    code_file: $ => seq(
      /code\s/,
      $.identifier,
      repeat($.code_statement),
      'endCode',
    ),
  }
});
