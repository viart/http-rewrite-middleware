'use strict';

var Rewriter = require('../index').Rewriter,
    res = {
        statusCode: 0,
        headers: {},
        wasEnded: 0,
        setHeader: function (key, value) {
            this.headers[key] = value;
        },
        end: function () {
            this.wasEnded++;
        },
        _reset: function () {
            this.wasEnded = 0;
            this.statusCode = 0;
            this.headers = {};
        }
    };

exports.middleware = {
    setUp: function (done) {
        this.rewriter = new Rewriter([], {silent: true});
        done();
    },
    tearDown: function (done) {
        delete this.rewriter;
        res._reset();
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
    testInternalRule: function (test) {
        var req = {},
            wasCompleted = 0;

        test.expect(12);

        test.equal(this.rewriter.registerRule({from: '^/fr[o0]m-([^-]+)-(\\d+)\\.html$', to: '/to-$1-$2.html'}), true);
        test.equal(this.rewriter.getRules().length, 1);

        req.url = '/fr0m-s0me-123.html';
        this.rewriter.getMiddleware()(req, res, function () { wasCompleted++; });
        test.equal(req.url, '/to-s0me-123.html', 'Should change matched URI.');
        test.equal(wasCompleted, 1, 'Should not block other middlewares.');
        test.equal(res.statusCode, 0, 'Should not change HTTP Status Code.');
        test.same(res.headers, {}, 'Should not change Headers.');
        test.equal(res.wasEnded, 0, 'Response should not be ended.');

        req.url = '/error-case.html';
        wasCompleted = 0;
        res._reset();
        this.rewriter.getMiddleware()(req, res, function () { wasCompleted++; });
        test.equal(req.url, '/error-case.html', 'Should not change not matched URI.');
        test.equal(wasCompleted, 1, 'Should not block other middlewares.');
        test.equal(res.statusCode, 0, 'Should not change HTTP Status Code.');
        test.same(res.headers, {}, 'Should not change Headers.');
        test.equal(res.wasEnded, 0, 'Response should not be ended.');

        test.done();
    },
    testRedirectRule: function (test) {
        var req = {},
            wasCompleted = 0;

        test.expect(12);

        test.equal(true,
            this.rewriter.registerRule({from: '^/fr[o0]m-([^-]+)-(\\d+)\\.html$', to: '/to-$1-$2.html', redirect: 'permanent'})
        );
        test.equal(this.rewriter.getRules().length, 1);

        req.url = '/fr0m-s0me-123.html';
        this.rewriter.getMiddleware()(req, res, function () { wasCompleted++; });
        test.equal(wasCompleted, 0, 'Should block other middlewares.');
        test.equal(req.url, '/fr0m-s0me-123.html', 'Should not change matched URI.');
        test.equal(res.statusCode, 301, 'Should change HTTP Status Code.');
        test.same(res.headers, {'Location': '/to-s0me-123.html'}, 'Should add the `Location` Header.');
        test.equal(res.wasEnded, 1, 'Response should be ended.');

        req.url = '/error-case.html';
        wasCompleted = 0;
        res._reset();
        this.rewriter.getMiddleware()(req, res, function () { wasCompleted++; });
        test.equal(wasCompleted, 1, 'Should not block other middlewares.');
        test.equal(req.url, '/error-case.html', 'Should not change not matched URI.');
        test.equal(res.statusCode, 0, 'Should not change HTTP Status Code.');
        test.same(res.headers, {}, 'Should not change Headers.');
        test.equal(res.wasEnded, 0, 'Response should not be ended.');

        test.done();
    },
    testLogging: function (test) {
        var req = {},
            wasCalled = 0;

        this.rewriter.log.verbose = function () {
            wasCalled++;
        };

        test.expect(1);

        this.rewriter.registerRule({from: '^/fr[o0]m-([^-]+)-(\\d+)\\.html$', to: '/to-$1-$2.html'});

        req.url = '/fr0m-s0me-123.html';
        this.rewriter.getMiddleware()(req, res, function () { });

        req.url = '/error-case.html';
        this.rewriter.getMiddleware()(req, res, function () { });

        test.equal(wasCalled, 1);

        test.done();
    }
};
