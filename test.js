const fs = require('fs');
const html = fs.readFileSync(__dirname + '/content.html', 'utf8');
const core = html.split('/* ===== CORE START ===== */')[1].split('/* ===== CORE END ===== */')[0];
const M = new Function(core + '\nreturn {tokenize, Parser, Runtime, interpret, AlefError, highlight, BUILTINS, KEYWORDS, fmt};')();

let pass = 0, fail = 0;
function run(src){
  const lines = [];
  M.interpret(src, s => lines.push(s), { maxMs: 3000 });
  return lines.join('\n');
}
function t(name, src, expected){
  let got;
  try { got = run(src); }
  catch (e) { got = 'ERR(' + (e.line||'?') + '): ' + e.message; }
  if (got === expected) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + '\n      expected: ' + JSON.stringify(expected) + '\n      got:      ' + JSON.stringify(got)); }
}

console.log('--- basics ---');
t('print', 'הצג "שלום עולם!"', 'שלום עולם!');
t('multi args', 'הצג "סכום:", 2 + 3', 'סכום: 5');
t('vars', 'יהי א = 5\nיהי ב = 3\nהצג א * ב', '15');
t('reassign', 'יהי x = 1\nx = x + 9\nהצג x', '10');
t('comment', '# hey\nהצג 1 // trailing\n', '1');
t('string concat num', 'הצג "מספר " + 7', 'מספר 7');
t('float fmt', 'הצג 0.1 + 0.2', '0.3');
t('power', 'הצג 2 ^ 10', '1024');
t('unary minus pow', 'הצג -2 ^ 2', '-4');
t('modulo neg', 'הצג -1 % 3', '2');
t('bool', 'הצג 3 > 2, 3 == 4, לא אמת', 'אמת שקר שקר');
t('and or', 'הצג אמת וגם שקר, שקר או אמת', 'שקר אמת');
t('null', 'הצג כלום', 'כלום');
t('str repeat', 'הצג "אב" * 3', 'אבאבאב');
t('cmp strings', 'הצג "א" < "ב"', 'אמת');
t('precedence', 'הצג 2 + 3 * 4, (2 + 3) * 4', '14 20');
t('not precedence', 'הצג לא 1 == 2', 'אמת');

console.log('--- control flow ---');
t('if', 'אם 5 > 3 אז\n הצג "כן"\nסוף', 'כן');
t('if-else', 'אם 1 > 3 אז\n הצג "כן"\nאחרת\n הצג "לא"\nסוף', 'לא');
t('else-if chain', 'יהי n = 84\nאם n >= 90 אז\n הצג "א"\nאחרת אם n >= 70 אז\n הצג "ב"\nאחרת\n הצג "ג"\nסוף', 'ב');
t('if no אז', 'אם 2 > 1\n הצג "ok"\nסוף', 'ok');
t('nested if', 'אם אמת אז\n אם אמת אז\n  הצג "עומק"\n סוף\nסוף', 'עומק');
t('for range', 'לכל i מ 1 עד 3\n הצג i\nסוף', '1\n2\n3');
t('for countdown', 'לכל i מ 3 עד 1\n הצג i\nסוף', '3\n2\n1');
t('for step', 'לכל i מ 0 עד 10 בקפיצות 5\n הצג i\nסוף', '0\n5\n10');
t('for each list', 'לכל x מתוך [10,20]\n הצג x\nסוף', '10\n20');
t('for each string', 'לכל c מתוך "אבג"\n הצג c\nסוף', 'א\nב\nג');
t('while', 'יהי i = 0\nכלעוד i < 3\n הצג i\n i = i + 1\nסוף', '0\n1\n2');
t('break', 'לכל i מ 1 עד 10\n אם i == 3 אז\n  עצור\n סוף\n הצג i\nסוף', '1\n2');
t('continue', 'לכל i מ 1 עד 4\n אם i % 2 == 0 אז\n  המשך\n סוף\n הצג i\nסוף', '1\n3');
t('break in while', 'יהי i = 0\nכלעוד אמת\n i = i + 1\n אם i > 2 אז\n עצור\n סוף\nסוף\nהצג i', '3');
t('semicolon sep', 'יהי a = 1; הצג a', '1');

console.log('--- functions ---');
t('func', 'פונקציה ריבוע(x)\n החזר x * x\nסוף\nהצג ריבוע(7)', '49');
t('recursion', 'פונקציה עצרת(נ)\n אם נ <= 1 אז\n  החזר 1\n סוף\n החזר נ * עצרת(נ - 1)\nסוף\nהצג עצרת(6)', '720');
t('fib', 'פונקציה פיב(נ)\n אם נ < 2 אז\n  החזר נ\n סוף\n החזר פיב(נ-1) + פיב(נ-2)\nסוף\nהצג פיב(15)', '610');
t('no return', 'פונקציה ריק()\n הצג "בפנים"\nסוף\nהצג ריק()', 'בפנים\nכלום');
t('closure', 'יהי כפל = 3\nפונקציה f(x)\n החזר x * כפל\nסוף\nהצג f(4)', '12');
t('early return', 'פונקציה ב(x)\n לכל i מ 1 עד 10\n  אם i == x אז\n   החזר "מצאתי " + i\n  סוף\n סוף\n החזר "לא"\nסוף\nהצג ב(4)', 'מצאתי 4');
t('func as value', 'פונקציה ג(x)\n החזר x+1\nסוף\nיהי כ = ג\nהצג כ(1)', '2');

console.log('--- lists & maps ---');
t('list index', 'יהי l = [5,6,7]\nהצג l[0], l[2], l[-1]', '5 7 7');
t('list print', 'הצג [1,"א",אמת]', '[1, "א", אמת]');
t('list assign', 'יהי l = [1,2]\nl[0] = 9\nהצג l', '[9, 2]');
t('list add', 'יהי l = [1]\nהוסף(l, 2, 3)\nהצג l, אורך(l)', '[1, 2, 3] 3');
t('list concat', 'הצג [1,2] + [3]', '[1, 2, 3]');
t('map', 'יהי m = {"שם":"דן","גיל":10}\nהצג m.שם, m["גיל"]', 'דן 10');
t('map set', 'יהי m = מפה()\nm["א"] = 1\nהצג m', '{"א": 1}');
t('map keys', 'יהי m = {"א":1,"ב":2}\nהצג מפתחות(m), ערכים(m)', '["א", "ב"] [1, 2]');
t('map iterate', 'יהי m = {"א":1,"ב":2}\nלכל k מתוך m\n הצג k + "=" + m[k]\nסוף', 'א=1\nב=2');
t('multiline list', 'יהי l = [\n 1,\n 2\n]\nהצג l', '[1, 2]');
t('nested', 'יהי d = {"רשימה":[1,{"עומק":"כן"}]}\nהצג d.רשימה[1].עומק', 'כן');
t('deep eq', 'הצג [1,2] == [1,2], [1] == [2]', 'אמת שקר');

console.log('--- builtins ---');
t('אורך', 'הצג אורך("שלום"), אורך([1,2,3])', '4 3');
t('מספר/טקסט', 'הצג מספר("42") + 1, טקסט(42) + "!"', '43 42!');
t('עגל', 'הצג עגל(3.14159, 2), עגל(2.5)', '3.14 3');
t('מיין', 'הצג מיין([3,1,2])', '[1, 2, 3]');
t('הפוך', 'הצג הפוך("אבג"), הפוך([1,2])', 'גבא [2, 1]');
t('פצל/חבר', 'הצג פצל("א,ב", ","), חבר(["א","ב"], "-")', '["א", "ב"] א-ב');
t('סכום/מקס', 'הצג סכום([1,2,3]), מקסימום([4,9,2]), מינימום(3, 1)', '6 9 1');
t('סוג', 'הצג סוג(1), סוג("א"), סוג([1]), סוג(כלום), סוג(אמת)', 'מספר טקסט רשימה כלום בוליאני');
t('מכיל/מיקום', 'הצג מכיל([1,2], 2), מיקום(["א","ב"], "ב")', 'אמת 1');
t('חתוך', 'הצג חתוך("שלום", 0, 2), חתוך([1,2,3], 1)', 'של [2, 3]');
t('החלף', 'הצג החלף("שלום עולם", "עולם", "כיתה")', 'שלום כיתה');
t('שורש', 'הצג שורש(144), מוחלט(-3)', '12 3');

console.log('--- errors (Hebrew messages) ---');
t('undefined var', 'הצג ש', 'ERR(1): המשתנה "ש" לא קיים. אפשר ליצור אותו כך:  יהי ש = ...');
t('div zero', 'הצג 1 / 0', 'ERR(1): אי אפשר לחלק באפס');
t('missing סוף', 'אם אמת אז\n הצג 1', 'ERR(2): חסרה המילה "סוף" שסוגרת את ה"אם" (שורה 1)');
t('bad index', 'יהי l = [1]\nהצג l[5]', 'ERR(2): המקום 5 לא קיים — ברשימה יש 1 איברים (0 עד 0)');
t('type error', 'הצג "א" - 1', 'ERR(1): הערך הראשון בחיסור חייב להיות מספר, אבל קיבלתי טקסט: "א"');
t('unterminated string', 'הצג "אב', 'ERR(1): מחרוזת שלא נסגרה — חסר " בסוף');
t('wrong arity', 'פונקציה f(a,b)\n החזר a\nסוף\nהצג f(1)', 'ERR(4): הפונקציה "f" מצפה ל־2 ארגומנטים, אבל קיבלה 1');
t('assign undeclared', 'x = 5', 'ERR(1): המשתנה "x" לא הוגדר. השתמש ב־"יהי x = ..." כדי ליצור אותו');
t('call non-func', 'יהי x = 5\nהצג x(1)', 'ERR(2): מספר הוא לא פונקציה — אי אפשר לקרוא לו עם סוגריים');
t('missing key', 'יהי m = {"א":1}\nהצג m.ב', 'ERR(2): המפתח "ב" לא קיים במפה');
(function(){
  let got; try { run('כלעוד אמת\n יהי x = 1\nסוף'); got = '(no error)'; } catch(e){ got = e.message; }
  if (/אולי יש לולאה אינסופית/.test(got)) { pass++; console.log('  ✓ infinite loop guard'); }
  else { fail++; console.log('  ✗ infinite loop guard → ' + got); }
})();
t('deep recursion', 'פונקציה ר(נ)\n החזר ר(נ+1)\nסוף\nהצג ר(1)', 'ERR(2): הפונקציה "ר" קראה לעצמה יותר מדי פעמים (רקורסיה עמוקה מדי)');

console.log('--- scoping ---');
t('block scope', 'אם אמת אז\n יהי מקומי = 1\nסוף\nהצג מקומי', 'ERR(4): המשתנה "מקומי" לא קיים. אפשר ליצור אותו כך:  יהי מקומי = ...');
t('outer mutate', 'יהי ס = 0\nלכל i מ 1 עד 4\n ס = ס + i\nסוף\nהצג ס', '10');
t('redeclare in loop', 'לכל i מ 1 עד 2\n יהי t = i * 2\n הצג t\nסוף', '2\n4');

console.log('--- hebrew punctuation ---');
t('gershayim string', 'הצג ״היי״', 'היי');
t('geresh string', 'הצג ׳שלום׳', 'שלום');
t('curly double', 'הצג “שלום עולם”', 'שלום עולם');
t('curly single', 'הצג ‘אב’', 'אב');
t('gershayim concat', 'יהי ש = ״דן״\nהצג ״שלום ״ + ש', 'שלום דן');
t('acronym identifier', 'יהי צה״ל = 5\nהצג צה״ל * 2', '10');
t('acronym in string', 'הצג "אני בצה״ל"', 'אני בצה״ל');
t('trailing geresh name', "יהי כיתה_י׳ = 10\nהצג כיתה_י׳", '10');
t('no space before quote', 'הצג״היי״', 'היי');
t('maqaf range', 'לכל i מ־1 עד־3\n הצג i\nסוף', '1\n2\n3');
t('maqaf with step', 'לכל i מ־0 עד־4 בקפיצות־2\n הצג i\nסוף', '0\n2\n4');
t('mixed quotes', 'הצג "רגיל", ״עברי״, ׳יחיד׳', 'רגיל עברי יחיד');
t('unterminated hebrew quote', 'הצג ״אב', 'ERR(1): מחרוזת שלא נסגרה — חסר ״ בסוף');
t('escape inside hebrew quote', 'הצג ״שורה\\nשנייה״', 'שורה\nשנייה');
t('hebrew quotes in condition', 'יהי ש = ״כן״\nאם ש == ״כן״ אז\n הצג ״עובד״\nסוף', 'עובד');
t('niqqud not identifier', 'יהי א = 1\nהצג א', '1');

console.log('--- highlight ---');
const h = M.highlight('יהי x = 1 # הערה');
console.log(/c-kw/.test(h) && /c-num/.test(h) && /c-com/.test(h) ? '  ✓ classes emitted' : '  ✗ highlight');
const h2 = M.highlight('הצג "<b>&"');
console.log(h2.indexOf('&lt;b&gt;&amp;') !== -1 ? '  ✓ html escaped' : '  ✗ escaping: ' + h2);

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
