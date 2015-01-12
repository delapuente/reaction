
# Reaction

Reaction is a JavaScript library to allow reactive properties for simple JavaScript objects.

## Usage

You can create a reactive object by including the reaction library and calling the `reaction` function.

```javascript
var character = reaction();
```

To prepare the object to deal with reactive properties, you need to declare them this way:

```javascript
character.reactive('vitality');
```

Now you can assing fragments of JavaScript referring other object's properties such as:

```javascript
character.vitality = '(con + siz)/2';
```

And as soon as you change the properties of the object that the reactive property depends on, the value of the property will be re-computed.

```javascript
character.con = 10;
character.siz = 12;
console.log(character.vitality); // will be 11
```

## Examples & tests
You can see examples of usage in the `showcase_tests.js` file and run them by installing the developer dependencies from bower:

```bash
$ bower install
```

Then open the `index.html` file.

## Limitations

Here is a list of features we actually lack of:
  * Circular dependency 
  * Improved identifier recognition to fully support JavaScript syntax
  * More builting types
  * Functions from popular spreadsheet software.
