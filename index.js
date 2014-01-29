/*
 * http-rewrite-middleware
 * https://github.com/viart/http-rewrite-middleware
 *
 * Copyright (c) 2013 Artem Vitiuk
 * Licensed under the MIT license.
 */
'use strict';

function Rewriter (rules, options) {
    options = options || {};

    this.rules = [];
    (rules || []).forEach(this.registerRule, this);

    var nop = function () {};
    if (options.silent) {
        this.log = {
            ok: nop,
            error: nop,
            verbose: nop
        };
    } else {
        this.log = {
            ok: console.log,
            error: console.error,
            verbose: options.verbose ? console.log : nop
        };
    }
}

Rewriter.prototype = {
    registerRule: function (rule) {
        var type = 'rewrite';

        rule = rule || {};

        if (this.isRuleValid(rule)) {
            if (rule.redirect) {
                rule.redirect = rule.redirect === 'permanent' ? 301 : 302;
                type = 'redirect ' + rule.redirect;
            }

            this.rules.push({
                from: new RegExp(rule.from),
                to: rule.to,
                redirect: rule.redirect
            });

            this.log.ok('Rewrite rule created for: [' + type.toUpperCase() + ': ' + rule.from + ' -> ' + rule.to + '].');
            return true;
        } else {
            this.log.error('Wrong rule given.');
            return false;
        }
    },

    isRuleValid: function (rule) {
        return rule.from && rule.to && typeof rule.from === 'string' && typeof rule.to === 'string';
    },

    resetRules: function () {
        this.rules = [];
    },

    getRules: function () {
        return this.rules;
    },

    dispatcher: function (req, res, next) {
        var logger = this.log.verbose;
        return function (rule) {
            var toUrl;
            if (rule.from.test(req.url)) {
                toUrl = req.url.replace(rule.from, rule.to);
                if (!rule.redirect) {
                    req.url = toUrl;
                    next();
                } else {
                    res.statusCode = rule.redirect;
                    res.setHeader('Location', toUrl);
                    res.end();
                }
                logger(
                    (rule.redirect ? 'redirect ' + rule.redirect : 'rewrite').toUpperCase() + ' > ' +
                    req.url + ' : ' + rule.from + ' -> ' + toUrl
                );
                return true;
            }
        };
    },

    getMiddleware: function () {
        return function (req, res, next) {
            if (!this.rules.length || !this.rules.some(this.dispatcher(req, res, next))) {
                next();
            }
        }.bind(this);
    }
};

module.exports.getMiddleware = function (rules, options) {
    return (new Rewriter(rules, options)).getMiddleware();
};

module.exports.Rewriter = Rewriter;
