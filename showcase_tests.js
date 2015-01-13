
describe('The reaction library', function () {

  var makeReactive, character;

  beforeEach(function () {
    character = {};
    makeReactive = reaction(character);
  });

  describe('The reaction function', function () {
    it('creates a declaration function to declare reactive properties',
    function () {
      expect(makeReactive).toEqual(jasmine.any(Function));
    });
  });

  describe('The declaration function', function () {
    it('has a reference to the reactive object', function () {
      expect(makeReactive.context).toBe(character);
    });

    it('accepts non empty objects', function () {
      var anotherCharacter = {
        con: 10,
        siz: 12,
        hp: '(con + siz)/2'
      };
      var makeReactive = reaction(anotherCharacter);

      makeReactive('hp');

      expect(anotherCharacter.hp).toBe(11);
    });

  });

  describe('The reactive object', function () {
    it('is a regular JavaScript object', function () {
      expect(character).toEqual(jasmine.any(Object));
    });

    it('can mix reactive and non reactive properties ', function () {
      makeReactive('completeName');

      character.name = 'Howard P.';
      character.surname = 'Lovecraft';

      character.completeName = 'name + " " + surname';

      expect(character.completeName).toBe('Howard P. Lovecraft');

      character.name = 'H.P.';

      expect(character.completeName).toBe('H.P. Lovecraft');
    });

    it('allow to declare reactive properties', function () {
      makeReactive('hp');
      character.hp = '(con + siz)/2';

      character.con = 10;
      character.siz = 12;

      expect(character.hp).toBe(11);
    });

    it('allow to declare multiple reactive properties', function () {
      makeReactive('hp', 'idea');
      character.hp = '(con + siz)/2';
      character.idea = 'edu * 5';

      character.con = 10;
      character.siz = 12;
      character.edu = 6;

      expect(character.hp).toBe(11);
      expect(character.idea).toBe(30);
    });

    it('does not take into account the order of updates', function () {
      makeReactive('hp', 'idea');

      character.con = 10;
      character.siz = 12;
      character.edu = 6;

      character.hp = '(con + siz)/2';
      character.idea = 'edu * 5';

      expect(character.hp).toBe(11);
      expect(character.idea).toBe(30);
    });

    it('allow cascading', function () {
      makeReactive('hp', 'damageLoss');

      character.con = 10;
      character.siz = 12;

      character.hp = '(con + siz)/2';
      character.damageLoss = 'hp * 0.1';

      expect(character.hp).toBe(11);
      expect(character.damageLoss).toBe(1.1);
    });

    it('react upon further changes', function () {
      makeReactive('hp', 'damageLoss');

      character.con = 10;
      character.siz = 12;

      character.hp = '(con + siz)/2';
      character.damageLoss = 'hp * 0.1';

      character.siz = 16;

      expect(character.hp).toBe(13);
      expect(character.damageLoss).toBe(1.3);
    });

    it('accepts built-in Math library', function () {
      makeReactive('visibility');

      character.con = 10;
      character.siz = 12;

      character.visibility = 'Math.max(con, siz)';

      expect(character.visibility).toBe(12);
    });

    it('accepts built-in Date type ', function () {
      makeReactive('date');

      character.month = 1;
      character.year = 12;
      character.day = 5;

      character.date = 'new Date(year, month-1, day)';

      expect(+character.date).toEqual(+(new Date(12,0,5)));
    });

    it('accepts reactive functions', function () {
      makeReactive('hp');

      character.hp = 'function () { return (con + siz)/2; }';

      character.con = 10;
      character.siz = 12;

      expect(character.hp).toEqual(jasmine.any(Function));
      expect(character.hp()).toBe(11);
    });

    describe('Dependency recognition', function () {
      it('detect and forbid simple cycles', function () {
        makeReactive('mood', 'humor');

        function makeCycle() {
          character.mood = 'humor';
          character.humor = 'mood';
        }

        expect(makeCycle).toThrowError(/cycle detected/i);
      });

      it('detect and forbid complex cycles', function () {
        makeReactive('mood', 'humor', 'intermediate');

        function makeCycle() {
          character.mood = 'humor';
          character.intermediate = 'mood';
          character.humor = 'intermediate';
        }

        expect(makeCycle).toThrowError(/cycle detected/i);
      });

      it('detect and forbid auto-cycles', function () {
        makeReactive('mood');

        function makeCycle() {
          character.mood = 'mood';
        }

        expect(makeCycle).toThrowError(/cycle detected/i);
      });

      it('declares found dependencies as new object properties', function () {
        makeReactive('r');

        character.r = 'a + b';

        var keys = Object.keys(character);
        expect(keys).toContain('r');
        expect(keys).toContain('a');
        expect(keys).toContain('b');
        expect(keys.length).toBe(3);
      });

      it('differentiate between identifiers and object properties', function () {
        makeReactive('r');

        character.a = { c: 0 };
        character.b = { d: 0 };
        character.r = 'a.c + b. d';

        var keys = Object.keys(character);
        expect(keys).toContain('r');
        expect(keys).toContain('a');
        expect(keys).toContain('b');
        expect(keys).not.toContain('c');
        expect(keys).not.toContain('d');
        expect(keys.length).toBe(3);
      });

      it('ignores names of function names and inside argument lists',
      function () {
        makeReactive('hp');

        character.hp = 'function f (a, b) { return (con + siz)/2; }';

        var keys = Object.keys(character);
        expect(keys).toContain('con');
        expect(keys).toContain('siz');
        expect(keys).toContain('hp');
        expect(keys).not.toContain('a');
        expect(keys).not.toContain('b');
        expect(keys).not.toContain('f');
        expect(keys.length).toBe(3);
      });

    });
  });

});
