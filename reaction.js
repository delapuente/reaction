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

    Object.defineProperty(context, 'reactive', {
      enumerable: false,
      value: function () {
        var varlist = [].slice.call(arguments);
        var options = {};
        if (typeof varlist[varlist.length - 1] === 'object') {
          options = varlist.pop();
        }
        varlist.forEach(function (property) {
            definitions[property] = definitions[property] || {
              definition: undefined,
              value: context[property]
            };
            definitions[property].reactive =
              definitions[property].reactive || !options.monitorOnly;
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
      }
    });
    return context;
  }

  function update(property, newDefinition, definitions, dependencies, context) {
    if (definitions[property].reactive) {
      if (typeof newDefinition === 'number') {
        newDefinition = '' + newDefinition;
      }
      var localDependencies = extractDependencies(newDefinition);
      var args = localDependencies.concat([{ monitorOnly: true  }]);
      context.reactive.apply(context, args);
      dependencies.addDependencies(property, localDependencies);
      definitions[property].definition = newDefinition;
    }
    else {
      definitions[property].value = newDefinition;
    }
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
    var result;
    if (!definitions[property].reactive) {
      result = definitions[property].value;
    }
    else {
      var formalList = dependencies.getDependenciesFor(property);
      var actualList = formalList.map(function (parameterName) {
        return builtins.isBuiltin(parameterName) ?
               builtins.get(parameterName) :
               definitions[parameterName].value;
      });
      var definition = definitions[property].definition;
      var code = '"use strict";\nreturn (' + definition + ');';
      var evaluator = new Function(formalList.join(','), code);
      result = evaluator.apply(undefined, actualList);
    }
    return result;
  }

  function extractDependencies(code) {
    var dependencies = [];
    var identifier = /(\.\s*?)?([_$a-zA-Z][_$\w]*)/g;
    var match = identifier.exec(code);
    while (match) {
      var point = match[1];
      var name = match[2];
      if (!point && keywords.indexOf(name) === -1) {
        dependencies.push(name);
      }
      match = identifier.exec(code);
    }
    return dependencies;
  }

  return reaction;
}));
