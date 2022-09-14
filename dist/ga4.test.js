"use strict";

var _gtag = _interopRequireDefault(require("./gtag"));

var _ga = _interopRequireDefault(require("./ga4"));

var _ga2 = require("./ga4.mock");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var newDate = new Date("2020-01-01");
jest.mock("./gtag");
jest.useFakeTimers("modern").setSystemTime(newDate.getTime());
describe("GA4", function () {
  // Given
  var GA_MEASUREMENT_ID = "GA_MEASUREMENT_ID";
  beforeEach(function () {
    _gtag["default"].mockReset();

    _ga["default"].reset();
  });
  describe("GA4.initialize()", function () {
    it("initialize() default", function () {
      // When
      _ga["default"].initialize(GA_MEASUREMENT_ID); // Then


      expect(_gtag["default"]).toHaveBeenNthCalledWith(1, "js", newDate);
      expect(_gtag["default"]).toHaveBeenNthCalledWith(2, "config", GA_MEASUREMENT_ID, {
        custom_map: _ga2.givenCustomMap,
        send_page_view: false
      });
      expect(_gtag["default"]).toHaveBeenCalledTimes(2);
    });
    it("initialize() with options", function () {
      // Given
      var options = {
        gaOptions: {
          cookieUpdate: false
        }
      }; // When

      _ga["default"].initialize(GA_MEASUREMENT_ID, options); // Then


      expect(_gtag["default"]).toHaveBeenNthCalledWith(1, "js", newDate);
      expect(_gtag["default"]).toHaveBeenNthCalledWith(2, "config", GA_MEASUREMENT_ID, {
        custom_map: _ga2.givenCustomMap,
        send_page_view: false,
        cookie_update: false
      });
      expect(_gtag["default"]).toHaveBeenCalledTimes(2);
    });
    it("initialize() in test mode", function () {
      // Given
      var options = {
        testMode: true
      };
      var command = "send";
      var object = {
        hitType: "pageview"
      }; // When

      _ga["default"].initialize(GA_MEASUREMENT_ID, options);

      _ga["default"].ga(command, object); // Then


      expect(_gtag["default"]).toHaveBeenCalledTimes(0);
    });
    it("initialize() multiple products", function () {
      // Given
      var GA_MEASUREMENT_ID2 = "GA_MEASUREMENT_ID2";
      var config = [{
        trackingId: GA_MEASUREMENT_ID
      }, {
        trackingId: GA_MEASUREMENT_ID2
      }]; // When

      _ga["default"].initialize(config); // Then


      expect(_gtag["default"]).toHaveBeenNthCalledWith(1, "js", newDate);
      expect(_gtag["default"]).toHaveBeenNthCalledWith(2, "config", GA_MEASUREMENT_ID, {
        custom_map: _ga2.givenCustomMap,
        send_page_view: false
      });
      expect(_gtag["default"]).toHaveBeenNthCalledWith(3, "config", GA_MEASUREMENT_ID2, {
        custom_map: _ga2.givenCustomMap,
        send_page_view: false
      });
      expect(_gtag["default"]).toHaveBeenCalledTimes(3);
    });
  });
  describe("GA4.ga()", function () {
    it("ga() send pageview", function () {
      // Given
      var command = "send";
      var object = {
        hitType: "pageview"
      }; // When

      _ga["default"].ga(command, object); // Then


      expect(_gtag["default"]).toHaveBeenNthCalledWith(1, "event", "page_view");
    });
    it("ga() send timing", function () {
      // Given
      var command = "send";
      var hitType = "timing";
      var timingCategory = "DOM";
      var timingVar = "first-contentful-paint";
      var timingValue = 120; // When

      _ga["default"].ga(command, hitType, timingCategory, timingVar, timingValue); // Then


      expect(_gtag["default"]).toHaveBeenNthCalledWith(1, "event", "timing_complete", {
        event_category: timingCategory,
        name: timingVar,
        value: timingValue
      });
    });
    it("ga() callback", function (done) {
      // Given
      var clientId = "clientId value";

      _gtag["default"].mockImplementationOnce(function (command, target, field_name, cb) {
        return cb(clientId);
      });

      var callback = jest.fn(function (tracker) {
        var trackerClientId = tracker.get("clientId");
        var trackerTrackingId = tracker.get("trackingId");
        var trackerApiVersion = tracker.get("apiVersion");
        expect(trackerClientId).toEqual(clientId);
        expect(trackerTrackingId).toEqual(GA_MEASUREMENT_ID);
        expect(trackerApiVersion).toEqual("1");
        done();
      }); // When

      _ga["default"].ga(callback); // Then


      expect(_gtag["default"]).toHaveBeenNthCalledWith(1, "get", GA_MEASUREMENT_ID, "client_id", expect.any(Function));
    });
    it("ga() async callback", function (done) {
      // Given
      var clientId = "clientId value";

      _gtag["default"].mockImplementationOnce(function (command, target, field_name, cb) {
        return cb(clientId);
      });

      var callback = jest.fn( /*#__PURE__*/function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(tracker) {
          var trackerClientId;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  trackerClientId = tracker.get("clientId");
                  expect(trackerClientId).toEqual(clientId);
                  done();

                case 3:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      }()); // When

      _ga["default"].ga(callback); // Then


      expect(_gtag["default"]).toHaveBeenNthCalledWith(1, "get", GA_MEASUREMENT_ID, "client_id", expect.any(Function));
    });
    it("ga() callback queue", function (done) {
      // Given
      var clientId = "clientId value";

      _gtag["default"].mockImplementationOnce(function (command, target, field_name, cb) {
        setImmediate(function () {
          return cb(clientId);
        });
      });

      var callback = jest.fn(function () {
        _ga["default"].ga("send", {
          hitType: "pageview"
        });

        expect(_gtag["default"]).toHaveBeenNthCalledWith(2, "event", "page_view");
        done();
      }); // When

      _ga["default"].ga(callback);

      _ga["default"].ga("send", "event", "category value"); // Then


      expect(_gtag["default"]).toHaveBeenNthCalledWith(1, "get", GA_MEASUREMENT_ID, "client_id", expect.any(Function));
      expect(_gtag["default"]).toHaveBeenCalledTimes(1);
      expect(_ga["default"]._isQueuing).toBeTruthy();
      expect(_ga["default"]._queueGtag).toHaveLength(1);
      jest.runAllTimers();
      expect(_ga["default"]._isQueuing).toBeFalsy();
      expect(_ga["default"]._queueGtag).toHaveLength(0);
      expect(_gtag["default"]).toHaveBeenNthCalledWith(3, "event", undefined, {
        event_category: "category value"
      });
    });
  });
  describe("GA4.send()", function () {
    it("send() pageview", function () {
      // Given
      var object = {
        hitType: "pageview"
      }; // When

      _ga["default"].send(object); // Then


      expect(_gtag["default"]).toHaveBeenNthCalledWith(1, "event", "page_view");
    });
  });
  describe("GA4.event()", function () {
    it("event() custom events", function () {
      // Given
      var eventName = "screen_view";
      var eventParams = {
        app_name: "myAppName",
        screen_name: "Home"
      }; // When

      _ga["default"].event(eventName, eventParams); // Then


      expect(_gtag["default"]).toHaveBeenNthCalledWith(1, "event", eventName, eventParams);
    });
    it("event() simple", function () {
      // Given
      var object = {
        category: "category value",
        action: "action value",
        label: "label value",
        nonInteraction: true
      }; // When

      _ga["default"].event(object); // Then


      expect(_gtag["default"]).toHaveBeenNthCalledWith(1, "event", "action value", {
        event_category: "category value",
        event_label: "label value",
        non_interaction: true
      });
    });
    it("event() with dimensions and metrics", function () {
      // Given
      var object = {
        category: "category value",
        action: "action value",
        label: "label value",
        nonInteraction: true,
        id: "id value",
        // id doesnt exist in event
        value: 0,
        dimension2: "dimension2 value",
        dimension4: "dimension4 value",
        metric2: "metric2 value"
      }; // When

      _ga["default"].event(object); // Then


      expect(_gtag["default"]).toHaveBeenNthCalledWith(1, "event", "action value", {
        event_category: "category value",
        event_label: "label value",
        non_interaction: true,
        dimension2: "dimension2 value",
        dimension4: "dimension4 value",
        metric2: "metric2 value",
        value: 0
      });
    });
  });
  describe("GA4.set()", function () {
    it("set()", function () {
      // Given
      var object = {
        anonymizeIp: true,
        referrer: "/signup",
        dimension2: "dimension2 value",
        dimension3: undefined,
        allowAdFeatures: "allowAdFeatures value",
        allowAdPersonalizationSignals: "allowAdPersonalizationSignals value",
        page: "/home"
      }; // When

      _ga["default"].set(object); // Then


      expect(_gtag["default"]).toHaveBeenNthCalledWith(1, "set", {
        anonymize_ip: true,
        referrer: "/signup",
        dimension2: "dimension2 value",
        allow_google_signals: "allowAdFeatures value",
        allow_ad_personalization_signals: "allowAdPersonalizationSignals value",
        page_path: "/home"
      });
      expect(Object.keys(_gtag["default"].mock.calls[0][1])).toContain("dimension3");
    });
  });
  describe("GA4.pageview()", function () {
    it("pageview()", function () {
      // Given
      var path = "/location-pathname";
      var title = "title value"; // When

      _ga["default"].pageview(path, undefined, title); // Then


      expect(_gtag["default"]).toHaveBeenNthCalledWith(1, "event", "page_view", {
        page_title: title,
        page_path: path
      });
    });
  });
  describe("GA4.outboundLink()", function () {
    function outboundLinkTest(givenTimeout) {
      // Given
      var label = "label value";

      _gtag["default"].mockImplementationOnce(function (command, event_name, event_params) {
        setTimeout(function () {
          return event_params.event_callback();
        }, givenTimeout);
      });

      var callback = jest.fn(function () {}); // When

      _ga["default"].outboundLink({
        label: label
      }, callback); // Then


      expect(_gtag["default"]).toHaveBeenNthCalledWith(1, "event", "Click", {
        event_category: "Outbound",
        event_label: "label value",
        event_callback: expect.any(Function)
      });
      expect(callback).toHaveBeenCalledTimes(0);
      jest.runAllTimers();
      expect(callback).toHaveBeenCalledTimes(1);
    }

    it("outboundLink() before 250ms timeout", function () {
      outboundLinkTest(100);
    });
    it("outboundLink() after 250ms timeout", function () {
      outboundLinkTest(300);
    });
  });
  describe("Reference", function () {
    it("pageview", function () {
      // Old https://developers.google.com/analytics/devguides/collection/analyticsjs/pages
      // New https://developers.google.com/gtagjs/reference/event#page_view
      // Given
      var hitType = "pageview";
      var path = "/location-pathname";
      var title = "title value"; // When / Then
      // Without parameters

      _ga["default"].send(hitType);

      expect(_gtag["default"]).toHaveBeenNthCalledWith(1, "event", "page_view");

      _ga["default"].send({
        hitType: hitType
      });

      expect(_gtag["default"]).toHaveBeenNthCalledWith(2, "event", "page_view");

      _ga["default"].ga("send", hitType);

      expect(_gtag["default"]).toHaveBeenNthCalledWith(3, "event", "page_view"); // With path parameter

      _ga["default"].send({
        hitType: hitType,
        page: path
      });

      expect(_gtag["default"]).toHaveBeenNthCalledWith(4, "event", "page_view", {
        page_path: path
      });

      _ga["default"].ga("send", hitType, path);

      expect(_gtag["default"]).toHaveBeenNthCalledWith(5, "event", "page_view", {
        page_path: path
      }); // With path and title parameter

      _ga["default"].send({
        hitType: hitType,
        page: path,
        title: title
      });

      expect(_gtag["default"]).toHaveBeenNthCalledWith(6, "event", "page_view", {
        page_path: path,
        page_title: title
      });

      _ga["default"].ga("send", hitType, path, {
        title: title
      });

      expect(_gtag["default"]).toHaveBeenNthCalledWith(7, "event", "page_view", {
        page_path: path,
        page_title: title
      });
    });
  });
  describe("Web vitals", function () {
    it("Web vitals", function () {
      // https://github.com/GoogleChrome/web-vitals/blob/main/README.md
      function sendToGoogleAnalytics(_ref2) {
        var name = _ref2.name,
            delta = _ref2.delta,
            value = _ref2.value,
            id = _ref2.id;

        _ga["default"].send({
          hitType: "event",
          eventCategory: "Web Vitals",
          eventAction: name,
          eventLabel: id,
          nonInteraction: true,
          // Built-in params:
          value: Math.round(name === "CLS" ? delta * 1000 : delta),
          // Use `delta` so the value can be summed.
          // Custom params:
          metric_id: id,
          // Needed to aggregate events.
          metric_value: value,
          // Optional.
          metric_delta: delta // Optional.
          // OPTIONAL: any additional params or debug info here.
          // See: https://web.dev/debug-web-vitals-in-the-field/
          // metric_rating: 'good' | 'ni' | 'poor',
          // debug_info: '...',
          // ...

        });
      }

      sendToGoogleAnalytics({
        name: "CLS",
        delta: 12.34,
        value: 1,
        id: "v2-1632380328370-6426221164013"
      });
      expect(_gtag["default"]).toHaveBeenNthCalledWith(1, "event", "CLS", {
        event_category: "Web Vitals",
        event_label: "v2-1632380328370-6426221164013",
        metric_delta: 12.34,
        metric_id: "v2-1632380328370-6426221164013",
        metric_value: 1,
        non_interaction: true,
        value: 12340
      });
    });
  });
});