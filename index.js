/*
 * grunt-rewrite-middleware
 * https://github.com/viart/grunt-rewrite-middleware
 *
 * Copyright (c) 2013 Artem Vitiuk
 * Licensed under the MIT license.
 */
'use strict';

function Rewriter (rules, grunt) {
    this.rules = [];
    this.initLogger(grunt);
    (rules || []).forEach(this.registerRule, this);
}

Rewriter.prototype = {
    log: function (type, message) {
        console[type === 'ok' ? 'log' : 'error'](message);
    },

    initLogger: function (grunt) {
        if (grunt) {
            this.log = function (type, message) {
                grunt.log[type](message);
            };
        }
    },

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

            this.log('ok', 'Rewrite rule created for: [' + type.toUpperCase() + ': ' + rule.from + ' -> ' + rule.to + '].');
            return true;
        } else {
            this.log('error', 'Wrong rule given.');
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

module.exports.getMiddleware = function (rules, grunt) {
    var rewriter = new Rewriter(rules, grunt);
    return rewriter.getMiddleware();
};

module.exports.Rewriter = Rewriter;
