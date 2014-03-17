'use strict';

describe('Directive: canvas', function () {

  // load the directive's module
  beforeEach(module('se10th20132App'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<canvas></canvas>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the canvas directive');
  }));
});
