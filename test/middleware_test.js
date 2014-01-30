'use strict';

var Rewriter = require('../index').Rewriter;

exports.middleware = {
    setUp: function (done) {
        this.rewriter = new Rewriter([], {silent: true});
        done();
    },
    tearDown: function (done) {
        delete this.rewriter;
        done();
    },
    testWrongRuleRegistration: function (test) {
        test.expect(5);

        test.equal(this.rewriter.registerRule(), false);
        test.equal(this.rewriter.registerRule({}), false);
        test.equal(this.rewriter.registerRule({from: 1}), false);
        test.equal(this.rewriter.registerRule({to: 0}), false);
        test.equal(this.rewriter.getRules().length, 0);

        test.done();
    },
    testCorrectRuleRegistration: function (test) {
        test.expect(3);

        test.equal(this.rewriter.registerRule({from: '', to: ''}), false);
        test.equal(this.rewriter.registerRule({from: '/from', to: '/to'}), true);
        test.equal(this.rewriter.getRules().length, 1);

        test.done();
    },
    testWithoutRules: function (test) {
        var _d = this.rewriter.dispatcher,
            wasCompleted = 0,
            wasDispached = 0;

        test.expect(2);

        this.rewriter.dispatcher = function () { wasDispached++; };

        this.rewriter.getMiddleware()({url: '/'}, null, function () { wasCompleted++; });
        test.equal(wasCompleted, 1, 'Should not block other middlewares.');
        test.equal(wasDispached, 0, 'Should not try to dispatch without RewriteRules.');

        this.rewriter.dispatcher = _d;

        test.done();
    },
    testRegExpRule: function (test) {
        var req = {},
            wasCompleted = 0;

        test.expect(6);

        test.equal(this.rewriter.registerRule({from: '^/fr[o0]m-([^-]+)-(\\d+)\\.html$', to: '/to-$1-$2.html'}), true);
        test.equal(this.rewriter.getRules().length, 1);

        req.url = '/fr0m-s0me-123.html';
        this.rewriter.getMiddleware()(req, null, function () { wasCompleted++; });
        test.equal(req.url, '/to-s0me-123.html', 'Should change matched URI.');
        test.equal(wasCompleted, 1, 'Should not block other middlewares.');

        req.url = '/error-case.html';
        wasCompleted = 0;
        this.rewriter.getMiddleware()(req, null, function () { wasCompleted++; });
        test.equal(req.url, '/error-case.html', 'Should not change not matched URI.');
        test.equal(wasCompleted, 1, 'Should not block other middlewares.');

        test.done();
    }
};
