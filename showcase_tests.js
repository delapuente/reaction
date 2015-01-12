
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

    it('accept Math library', function () {
      character.reactive('visibility');

      character.con = 10;
      character.siz = 12;

      character.visibility = 'Math.max(con, siz)';

      expect(character.visibility).toBe(12);
    });

    it('accept Date library', function () {
      character.reactive('date');

      character.month = 1;
      character.year = 12;
      character.day = 5;

      character.date = 'new Date(year, month-1, day)';

      expect(+character.date).toEqual(+(new Date(12,0,5)));
    });
  });

});
