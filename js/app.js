/* jshint browser: true */
/* global angular, CONFIG, _ */

'use strict';

angular.module('VoteBrain', ['goangular'])
  .config(function(goConnectionProvider) {
    goConnectionProvider.set(CONFIG.connectUrl);
  })
  .controller('ListCtrl', function($scope, goConnection) {
    var itemsKey;

    goConnection.ready().then(function(goinstant) {
      return goinstant.room('brainstorm').join().get('room');
    }).then(function(room) {
      itemsKey = room.key('items');

      return itemsKey.get().get('value');
    }).then(function(value) {
      $scope.items = value || {};

      $scope.addIdea = function() {
        if (_.isEmpty($scope.idea)) {
          return;
        }

        itemsKey.add({ idea: $scope.idea, votes: 0});
        $scope.idea = '';
      };

      $scope.addVote = function(key) {
        itemsKey.key(key + "/votes").get().then(function (value) {
          itemsKey.key(key + "/votes").set(value.value + 1);
        });
      };

        $scope.removeVote = function(key) {
          itemsKey.key(key + "/votes").get().then(function (value) {
            if (value.value > 0) {
              itemsKey.key(key + "/votes").set(value.value - 1);
            }
          });
        };

      itemsKey.on('set', {
        local: true,
        bubble: true,
        listener: function(value, context) {
            $scope.$apply(function () {
              console.log(context.key.split('/'));
              var a = context.key.split('/');
              $scope.items[a[a.length - 2]].votes = value;
            });
        }
      });

      itemsKey.on('add', {
        local: true,
        listener: function(value, context) {
          $scope.$apply(function() {
            $scope.items[(_.last(context.addedKey.split('/')))] = value;
          });
        }
      });
    }).finally(function() {
      $scope.$apply();
    });
  });