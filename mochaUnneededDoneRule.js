"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Lint = require('tslint/lib/lint');
var ErrorTolerantWalker_1 = require('./utils/ErrorTolerantWalker');
var SyntaxKind_1 = require('./utils/SyntaxKind');
var Utils_1 = require('./utils/Utils');
var MochaUtils_1 = require('./utils/MochaUtils');
var FAILURE_STRING = 'Unneeded Mocha Done. Parameter can be safely removed: ';
var Rule = (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        _super.apply(this, arguments);
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new MochaUnneededDoneRuleWalker(sourceFile, this.getOptions()));
    };
    Rule.metadata = {
        ruleName: 'mocha-unneeded-done',
        type: 'maintainability',
        description: 'A function declares a MochaDone parameter but only resolves it synchronously in the main function.',
        options: null,
        issueClass: 'Ignored',
        issueType: 'Warning',
        severity: 'Low',
        level: 'Opportunity for Excellence',
        group: 'Clarity'
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var MochaUnneededDoneRuleWalker = (function (_super) {
    __extends(MochaUnneededDoneRuleWalker, _super);
    function MochaUnneededDoneRuleWalker() {
        _super.apply(this, arguments);
    }
    MochaUnneededDoneRuleWalker.prototype.visitSourceFile = function (node) {
        if (MochaUtils_1.MochaUtils.isMochaTest(node)) {
            _super.prototype.visitSourceFile.call(this, node);
        }
    };
    MochaUnneededDoneRuleWalker.prototype.visitArrowFunction = function (node) {
        this.validateMochaDoneUsage(node);
        _super.prototype.visitArrowFunction.call(this, node);
    };
    MochaUnneededDoneRuleWalker.prototype.visitFunctionExpression = function (node) {
        this.validateMochaDoneUsage(node);
        _super.prototype.visitFunctionExpression.call(this, node);
    };
    MochaUnneededDoneRuleWalker.prototype.validateMochaDoneUsage = function (node) {
        var doneIdentifier = this.maybeGetMochaDoneParameter(node);
        if (doneIdentifier == null) {
            return;
        }
        if (!this.isIdentifierInvokedDirectlyInBody(doneIdentifier, node)) {
            return;
        }
        var walker = new IdentifierReferenceCountWalker(this.getSourceFile(), this.getOptions(), doneIdentifier);
        var count = walker.getReferenceCount(node.body);
        if (count === 1) {
            this.addFailure(this.createFailure(doneIdentifier.getStart(), doneIdentifier.getWidth(), FAILURE_STRING + doneIdentifier.getText()));
        }
    };
    MochaUnneededDoneRuleWalker.prototype.isIdentifierInvokedDirectlyInBody = function (doneIdentifier, node) {
        if (node.body == null || node.body.kind !== SyntaxKind_1.SyntaxKind.current().Block) {
            return;
        }
        var block = node.body;
        return Utils_1.Utils.exists(block.statements, function (statement) {
            if (statement.kind === SyntaxKind_1.SyntaxKind.current().ExpressionStatement) {
                var expression = statement.expression;
                if (expression.kind === SyntaxKind_1.SyntaxKind.current().CallExpression) {
                    var leftHandSideExpression = expression.expression;
                    return leftHandSideExpression.getText() === doneIdentifier.getText();
                }
            }
            return false;
        });
    };
    MochaUnneededDoneRuleWalker.prototype.maybeGetMochaDoneParameter = function (node) {
        if (node.parameters.length === 0) {
            return null;
        }
        var allDones = node.parameters.filter(function (parameter) {
            if (parameter.type != null && parameter.type.getText() === 'MochaDone') {
                return true;
            }
            return parameter.name.getText() === 'done';
        });
        if (allDones.length === 0 || allDones[0].name.kind !== SyntaxKind_1.SyntaxKind.current().Identifier) {
            return null;
        }
        return allDones[0].name;
    };
    return MochaUnneededDoneRuleWalker;
}(ErrorTolerantWalker_1.ErrorTolerantWalker));
var IdentifierReferenceCountWalker = (function (_super) {
    __extends(IdentifierReferenceCountWalker, _super);
    function IdentifierReferenceCountWalker(sourceFile, options, identifier) {
        _super.call(this, sourceFile, options);
        this.identifierText = identifier.getText();
    }
    IdentifierReferenceCountWalker.prototype.getReferenceCount = function (body) {
        var _this = this;
        this.count = 0;
        body.statements.forEach(function (statement) {
            _this.walk(statement);
        });
        return this.count;
    };
    IdentifierReferenceCountWalker.prototype.visitIdentifier = function (node) {
        if (node.getText() === this.identifierText) {
            this.count = this.count + 1;
        }
        _super.prototype.visitIdentifier.call(this, node);
    };
    return IdentifierReferenceCountWalker;
}(ErrorTolerantWalker_1.ErrorTolerantWalker));
//# sourceMappingURL=mochaUnneededDoneRule.js.map