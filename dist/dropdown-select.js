(function (window, angular) {
  'use strict';

  const apps = angular.module('DropDownSelect', []);

  apps.run([
    '$templateCache',
    function ($templateCache) {
      $templateCache.put(
        'template/dropdownSelect.html',
        [
          `<div class="{{dsClass}} ng-dropdown-container">`,
          `    <div class="ng-dropdown-text">`,
          `        <span>{{dsMultiple ? (getValueLabel(dsModel) || "-- Select --") : (getValueLabel(dsModel) || "-- Select --")}}</span>`,
          `    </div>`,
          `    <ul class="dropdown-menu ng-dropdown-options">`,
          `        <li class="ng-dropdown-item">`,
          `            <input type="text" class="form-control" ng-model="searchText">`,
          `        </li>`,
          `        <li class="ng-dropdown-item" ng-click="Clear()" ng-class="{'selected':dsMultiple ? !dsModel.length : !dsModel}">`,
          `            -- Select --`,
          `        </li>`,
          `        <li class="ng-dropdown-item" ng-class="{'selected':isSelected(item[dsValue])}" `,
          `        ng-repeat="item in dsData | filter:dsSearchFilter" data-item="{{item}}" ng-click="SelectItem($event, item)">`,
          `            <input type="checkbox" ng-if="dsMultiple" ng-checked="isSelected(item[dsValue])">`,
          `            {{item[dsLabel]}}`,
          `        </li>`,
          `    </ul>`,
          `</div>`
        ].join('')
      );
    }
  ]);

  apps.directive('dropdownSelect', [
    function () {
      return {
        restrict: 'E',
        replace: true,
        scope: {
          dsModel: '=',
          dsData: '=',
          dsClass: '@',
          dsLabel: '@',
          dsValue: '@',
          dsChange: '&',
          dsMultiple: '@'
        },
        controller: [
          '$scope',
          '$element',
          '$document',
          'filterFilter',
          function ($scope, $element, $document, filterFilter) {

            if ($scope.dsMultiple && !Array.isArray($scope.dsModel)) {
              $scope.dsModel = [];
            }

            $scope.searchText = '';
            $scope.dsSearchFilter = function (item) {
              return (
                !$scope.searchText ||
                (item[$scope.dsLabel] &&
                  item[$scope.dsLabel]
                  .toLowerCase()
                  .indexOf($scope.searchText.toLowerCase()) > -1)
              );
            };

            $scope.getValueLabel = function (value) {
              if($scope.dsMultiple){
                let selectedItems = [];
                value.forEach(function(currentValue){
                  const item = $scope.dsData.find(item => item[$scope.dsValue] === currentValue);
                  selectedItems.push(item ? item[$scope.dsLabel] : $scope.dsValue);
                });

                return selectedItems.join(', ');

              }else{
                const item = $scope.dsData.find(item => item[$scope.dsValue] === value);
                return item ? item[$scope.dsLabel] : '';
              }
            };

            $scope.isSelected = function (value) {
              return $scope.dsMultiple ? $scope.dsModel.includes(value) : $scope.dsModel === value;
            };

            $scope.SelectItem = function ($event, item) {
              const value = item[$scope.dsValue];
              if ($scope.dsMultiple) {
                const index = $scope.dsModel.indexOf(value);
                if (index > -1) {
                  $scope.dsModel.splice(index, 1);
                } else {
                  $scope.dsModel.push(value);
                }
              } else {
                $scope.dsModel = value;
                $element[0].classList.remove('show');
              }
              $scope.searchText = '';
              setTimeout(function () {
                $scope.$eval($scope.dsChange);
              }, 100);
            };

            $scope.Clear = function () {
              $scope.dsModel = $scope.dsMultiple ? [] : '';
              $element[0].classList.remove('show');
              $scope.searchText = '';
              setTimeout(function () {
                $scope.$eval($scope.dsChange);
              }, 100);
            }

            $scope.$watch("dsData", function (newValue, oldValue) {
              if (newValue != oldValue) {
                const SelectItem = filterFilter(newValue, $scope.dsModel);
                if (!SelectItem || SelectItem.length < 1) {
                  $scope.dsModel = $scope.dsMultiple ? [] : '';
                }
              }
            });

            const onDropDownSelectClick = function ($event) {
              const ele = $event.target;

              const isTarget = ele.closest('.ng-dropdown-text') !== null;

              if (isTarget) {
                $element[0].classList.toggle('show');
              }
            };

            const onDocumentMouseUp = function ($event) {
              if (!$event || !$event.target) {
                return;
              }

              const isDropdownContainer = $element[0].contains($event.target);

              if (!isDropdownContainer) {
                $element[0].classList.remove('show');
                $scope.searchText = '';
              }
            };

            $element[0].addEventListener('click', onDropDownSelectClick);
            document.addEventListener('mouseup', onDocumentMouseUp);

            $scope.$on('$destroy', function () {
              $element[0].removeEventListener('click', onDropDownSelectClick);
              document.removeEventListener('mouseup', onDocumentMouseUp);
            });
          }
        ],
        templateUrl: 'template/dropdownSelect.html'
      };
    }
  ]);
})(window, window.angular);
