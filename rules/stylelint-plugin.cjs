const { utils, createPlugin } = require('stylelint')
const
  parseSelector = require('stylelint/lib/utils/parseSelector'),
  whitespaceChecker = require('stylelint/lib/utils/whitespaceChecker'),
  isStandardSyntaxRule = require('stylelint/lib/utils/isStandardSyntaxRule')

const ruleName = 'in/selector-combinator-space-after'
const messages = utils.ruleMessages(ruleName, {
  expected: combinator => `Expected single space after "${ combinator }"`
})
module.exports = createPlugin(ruleName, function rule(expectation, options, context) {
  const checker = whitespaceChecker('space', expectation, messages)

  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, {
      actual: expectation,
      possible: ['always', 'never']
    })
    if (!validOptions) {
      return
    }
    const isAutoFixing = Boolean(context.fix)

    let hasFixed
    root.walkRules(rule => {
      if (!isStandardSyntaxRule(rule)) {
        return
      }

      const selector = rule.raws.selector ? rule.raws.selector.raw : rule.selector

      const fixedSelector = parseSelector(selector, result, rule, selectorTree => {
        selectorTree.walkCombinators(node => {
          if (/\s/.test(node.value)) {
            return
          }
          const parentParentNode = node.parent && node.parent.parent

          // Ignore pseudo-classes selector like `.foo:nth-child(2n + 1) {}`
          if (parentParentNode && parentParentNode.type === 'pseudo') {
            return
          }

          const sourceIndex = node.sourceIndex
          const index = node.value.length > 1
            ? sourceIndex
            : sourceIndex + node.value.length - 1

          if (node.spaces.after === ' ') {
            return
          }

          if (isAutoFixing) {
            const nSelector = rule.selector.slice(0, index + 1) + ' ' + rule.selector.slice(index + 1)
            if (!rule.raws.selector) {
              rule.selector = nSelector
            } else {
              rule.raws.selector.raw = nSelector
            }
          } else {
            utils.report({
              ruleName,
              node: rule,
              message: messages.expected(node.value),
              index: sourceIndex,
              result: result
            })
          }
        })
      })

      if (hasFixed) {
        if (!rule.raws.selector) {
          rule.selector = fixedSelector
        } else {
          rule.raws.selector.raw = fixedSelector
        }
      }
    })
  }
})
module.exports.messages = messages
