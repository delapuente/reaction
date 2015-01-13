
describe('The reaction library', function () {

  var character;

  beforeEach(function () {
    character = reaction();
  });

  describe('The reaction function', function () {
    it('creates a reactive object', function () {
      expect(character).toBeDefined();
    });
  });

  describe('The reaction object', function () {
    it('is a regular JavaScript object', function () {
      expect(character).toEqual(jasmine.any(Object));
    });

    it('can mix reactive and non reactive properties ', function () {
      character.reactive('completeName');

      character.name = 'Howard P.';
      character.surname = 'Lovecraft';

      character.completeName = 'name + " " + surname';

      expect(character.completeName).toBe('Howard P. Lovecraft');

      character.name = 'H.P.';

      expect(character.completeName).toBe('H.P. Lovecraft');
    });

    it('allow to declare reactive properties', function () {
      character.reactive('hp');
      character.hp = '(con + siz)/2';

      character.con = 10;
      character.siz = 12;

      expect(character.hp).toBe(11);
    });

    it('allow to declare multiple reactive properties', function () {
      character.reactive('hp', 'idea');
      character.hp = '(con + siz)/2';
      character.idea = 'edu * 5';

      character.con = 10;
      character.siz = 12;
      character.edu = 6;

      expect(character.hp).toBe(11);
      expect(character.idea).toBe(30);
    });

    it('does not take into account the order of updates', function () {
      character.reactive('hp', 'idea');

      character.con = 10;
      character.siz = 12;
      character.edu = 6;

      character.hp = '(con + siz)/2';
      character.idea = 'edu * 5';

      expect(character.hp).toBe(11);
      expect(character.idea).toBe(30);
    });

    it('allow cascading', function () {
      character.reactive('hp', 'damageLoss');

      character.con = 10;
      character.siz = 12;

      character.hp = '(con + siz)/2';
      character.damageLoss = 'hp * 0.1';

      expect(character.hp).toBe(11);
      expect(character.damageLoss).toBe(1.1);
    });

    it('react upon further changes', function () {
      character.reactive('hp', 'damageLoss');

      character.con = 10;
      character.siz = 12;

      character.hp = '(con + siz)/2';
      character.damageLoss = 'hp * 0.1';

      character.siz = 16;

      expect(character.hp).toBe(13);
      expect(character.damageLoss).toBe(1.3);
    });

    it('accepts built-in Math library', function () {
      character.reactive('visibility');

      character.con = 10;
      character.siz = 12;

      character.visibility = 'Math.max(con, siz)';

      expect(character.visibility).toBe(12);
    });

    it('accepts built-in Date type ', function () {
      character.reactive('date');

      character.month = 1;
      character.year = 12;
      character.day = 5;

      character.date = 'new Date(year, month-1, day)';

      expect(+character.date).toEqual(+(new Date(12,0,5)));
    });

    describe('Dependency recognition', function () {
      it('declares found dependencies as new object properties', function () {
        character.reactive('r');

        character.r = 'a + b';

        var keys = Object.keys(character);
        expect(keys).toContain('r');
        expect(keys).toContain('a');
        expect(keys).toContain('b');
        expect(keys.length).toBe(3);
      });

      it('differentiate between identifiers and object properties', function () {
        character.reactive('r');

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
    });
  });

});
