(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    var original = root.reaction;
    root.reaction = factory();
    root.reaction.restore = function () {
      root.reaction = original;
      return this;
    };
  }
}(this, function () {
  'use strict';

  function DependencyMap() {
    this._dependencies = Object.create(null);
    this._affected = Object.create(null);
  }

  DependencyMap.prototype.addDependencies = function (name, dependencies) {
    this._dependencies[name] = this._dependencies[name] || Object.create(null);
    dependencies.forEach(function (dependency) {
      this._dependencies[name][dependency] = true;
      this._affected[dependency] = this._affected[dependency] || {};
      this._affected[dependency][name] = true;
    }.bind(this));
  };

  DependencyMap.prototype.getAffectedBy = function (name) {
    return Object.keys(this._affected[name] || Object.create(null));
  };

  DependencyMap.prototype.getDependenciesFor = function (name) {
    return Object.keys(this._dependencies[name] || Object.create(null));
  };

  var builtins = {
    'Math': Math,
    'Date': Date
  };
  builtins.isBuiltin = function (name) {
    return builtins[name] instanceof Object;
  };
  builtins.get = function (name) {
    return builtins[name];
  };

  var keywords = [
    'new'
  ];

  function reaction(context) {
    context = context || {};
    var definitions = {};
    var dependencies = new DependencyMap();

    context.reactive = function () {
      [].forEach.call(arguments, function (property) {
          definitions[property] = definitions[property] || {
            definition: undefined,
            value: context[property]
          };
          Object.defineProperty(context, property, {
            configurable: true,
            enumerable: true,
            set: function (newDefinition) {
              update(
                property,
                newDefinition,
                definitions,
                dependencies,
                context
              );
            },
            get: function () {
              return definitions[property].value;
            }
          });
      });
    };

    return context;
  }

  function update(property, newDefinition, definitions, dependencies, context) {
    if (typeof newDefinition === 'number') {
      newDefinition = '' + newDefinition;
    }
    var localDependencies = extractDependencies(newDefinition);
    context.reactive.apply(context, localDependencies);
    dependencies.addDependencies(property, localDependencies);
    definitions[property].definition = newDefinition;
    compute(property, definitions, dependencies);
  }

  function compute(property, definitions, dependencies) {
    var value = computeValue(property, definitions, dependencies);
    definitions[property].value = value;
    var affected = dependencies.getAffectedBy(property);
    affected.forEach(function (affectedProperty) {
      compute(affectedProperty, definitions, dependencies);
    });
  }

  function computeValue(property, definitions, dependencies) {
    var formalList = dependencies.getDependenciesFor(property);
    var actualList = formalList.map(function (parameterName) {
      return builtins.isBuiltin(parameterName) ?
             builtins.get(parameterName) :
             definitions[parameterName].value;
    });
    var definition = definitions[property].definition;
    var code = '"use strict";\nreturn (' + definition + ');';
    var evaluator = new Function(formalList.join(','), code);
    return evaluator.apply(undefined, actualList);
  }

  function extractDependencies(code) {
    var dependencies = [];
    var identifier = /(?:^|[^.])([_$a-zA-Z][_$\w]*)/g;
    var match = identifier.exec(code);
    while (match) {
      if (keywords.indexOf(match[1]) === -1) {
        dependencies.push(match[1]);
      }
      match = identifier.exec(code);
    }
    return dependencies;
  }

  return reaction;
}));
