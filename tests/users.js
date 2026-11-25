// Kassirlər, PIN ilə giriş, icazələr və hər əməliyyatdan sonra ehtiyat nüsxə: node tests/users.js
// exe mühiti (erpLoad/erpSave/erpBackup/erpBackupKinds...) Node yaddaşında təqlid olunur.
const { chromium } = require('playwright');
const path = require('path');
const fs = { data: '', backups: [] };
let n = 0;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1366, height: 768 } });
  const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
  const errs = [];
  const open = async () => {
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { window.KASSA_SAMPLE = 1; }); // nümunə kassirlərlə (Leyla, Rəşad)
    await p.exposeFunction('erpLoad', () => fs.data);
    await p.exposeFunction('erpSave', j => { fs.data = j; });
    await p.exposeFunction('erpBackup', (j, kind) => { const k = ['avto', 'emel'].includes(kind) ? kind : 'el'; const name = `kassa-2026-11-09_10-00-${String(n++).padStart(2, '0')}-${k}.json`; fs.backups.unshift({ name, size: j.length, time: Date.now(), j }); return name; });
    await p.exposeFunction('erpBackupList', () => fs.backups.map(({ name, size, time }) => ({ name, size, time })));
    await p.exposeFunction('erpBackupKinds', () => ['avto', 'el', 'emel']);
    await p.exposeFunction('erpBackupRead', nm => fs.backups.find(x => x.name === nm).j);
    await p.exposeFunction('erpPaths', () => ({ data: 'C:\\data.json', backup: 'C:\\ehtiyat' }));
    await p.exposeFunction('erpOpenFolder', () => null);
    await p.goto('file://' + path.resolve('app/index.html'));
    await p.waitForTimeout(400);
    return p;
  };
  const kinds = k => fs.backups.filter(x => x.name.endsWith(`-${k}.json`)).length;
  const sellOne = async p => { await p.fill('#q', 'fincan termo'); await p.press('#q', 'Enter'); await p.click('#btnDone'); };

  // 1) Yeni quraşdırma: Admin PIN-siz → birbaşa açılır, işçilər kassirə çevrilib
  let p = await open();
  ok(await p.isHidden('#ovLogin'), 'admin PIN-i yoxdursa giriş ekranı çıxmır');
  ok((await p.textContent('#userName')).includes('Admin (admin)'), 'başlıqda: Admin (admin)');
  const d0 = JSON.parse(fs.data);
  ok(d0.users.length === 3 && d0.users.filter(u => u.role === 'admin').length === 1 && d0.users.find(u => u.name === 'Leyla').role === 'kassir', 'işçilər istifadəçiyə çevrildi: 1 admin + 2 kassir');
  ok(await p.isVisible('#btnSet') && await p.isVisible('#btnExp') && await p.isHidden('#btnEdit'), 'admin bütün düymələri görür (Düzəliş Ayarların içində)');

  // 2) Hər əməliyyatdan sonra nüsxə; dəyişiklik yoxdursa, yazılmır
  const e0 = kinds('emel');
  await sellOne(p); await p.waitForTimeout(2600);
  ok(kinds('emel') === e0 + 1, 'satışdan sonra "əməliyyat" nüsxəsi yarandı');
  ok(JSON.parse(fs.backups.find(x => x.name.endsWith('-emel.json')).j).data.sales.length === 1, 'nüsxədə yeni satış var');
  await sellOne(p); await sellOne(p); await p.waitForTimeout(2600);
  ok(kinds('emel') === e0 + 2, 'ard-arda 2 satış bir nüsxəyə yığıldı');
  await p.evaluate(() => save()); await p.waitForTimeout(2600);
  ok(kinds('emel') === e0 + 2, 'heç nə dəyişməyibsə, nüsxə yazılmır');

  // 3) Admin Kassirlər bölməsi: PIN qoyur, kassir əlavə edir, icazə verir
  await p.click('#btnSet'); await p.click('[data-rt=users]');
  ok((await p.textContent('#rbody')).includes('Admin üçün PIN qoyulmayıb'), 'admin PIN-siz: xəbərdarlıq görünür');
  const adminId = d0.users.find(u => u.role === 'admin').id, leyla = d0.users.find(u => u.name === 'Leyla').id;
  await p.fill(`#u_p_${adminId}`, '12'); await p.click(`[data-act=upin][data-id=${adminId}]`);
  ok((await p.textContent('#toast')).includes('4–6 rəqəm'), 'qısa PIN qəbul olunmur');
  await p.fill(`#u_p_${adminId}`, '1111'); await p.click(`[data-act=upin][data-id=${adminId}]`);
  ok(!(await p.textContent('#rbody')).includes('Admin üçün PIN qoyulmayıb'), 'admin PIN qoydu, xəbərdarlıq getdi');
  ok(!fs.data.includes('"1111"'), 'PIN faylda açıq yazılmır');
  await p.fill(`#u_p_${leyla}`, '2222'); await p.click(`[data-act=upin][data-id=${leyla}]`);
  await p.fill('#nu_name', 'leyla'); await p.click('[data-act=uadd]');
  ok((await p.textContent('#toast')).includes('artıq var'), 'eyni adlı ikinci işçi olmur');
  await p.fill('#nu_name', 'Nigar'); await p.fill('#nu_pin', '3333'); await p.click('[data-act=uadd]');
  const nigar = JSON.parse(fs.data).users.find(u => u.name === 'Nigar');
  ok(nigar && nigar.role === 'kassir' && nigar.perms.zay && nigar.perms.hist && !nigar.perms.cost, 'Nigar əlavə olundu: standart icazələr (zay, tarixçə)');
  await p.check(`[data-up="${nigar.id}"][data-k=reports]`);
  ok(JSON.parse(fs.data).users.find(u => u.id === nigar.id).perms.reports === 1, 'Nigar-a "günlük hesabat" icazəsi verildi');
  ok(await p.evaluate(() => [...document.querySelectorAll('.permh')].map(x => x.textContent).join('|').startsWith('🛒 Satış ekranı|🧾 Satış tarixçəsi|🗑️ Zay|📊 Hesabat')) && !(await p.$('[data-k=supp]')) && !(await p.$('[data-k=suppRep]')), 'v1.9.0: icazələr qruplara bölünüb, işləməyən 2 tədarükçü qutusu yoxdur');
  for (const k of ['rb_nagd', 'rb_kart', 'rb_nisye', 'rb_kassapul', 'rb_artiq', 'rb_zay']) await p.check(`[data-up="${nigar.id}"][data-k=${k}]`);
  ok(await p.locator(`[data-ur="${adminId}"]`).isDisabled() && !(await p.locator(`[data-act=udel][data-id="${adminId}"]`).count()), 'admin özünü silə və vəzifəsini dəyişə bilməz');
  await p.click('#ovRep [data-close]');

  // 4) Çıxış → giriş ekranı; səhv və düz PIN
  await p.click('#btnUser');
  ok(await p.isVisible('#ovLogin') && await p.locator('.utile').count() === 4, 'çıxış: giriş ekranında 4 işçi');
  await p.click(`[data-login="${leyla}"]`);
  await p.keyboard.type('9999'); await p.keyboard.press('Enter');
  ok((await p.textContent('.pinerr')).includes('səhvdir') && await p.isVisible('#ovLogin'), 'səhv PIN: girmir');
  await p.click('[data-pin="2"]'); await p.click('[data-pin="2"]'); await p.keyboard.type('22'); await p.click('[data-pin=go]');
  ok(await p.isHidden('#ovLogin') && (await p.textContent('#userName')).trim() === 'Leyla', 'düz PIN (ekran + klaviatura): Leyla girdi');
  // v0.91.0: kassir kassanı açmadan satış edə bilməz
  await p.waitForTimeout(500);
  ok(await p.isVisible('#ovKassa') && (await p.textContent('#kzBody')).includes('əvvəl kassanı'), 'Leyla girən kimi kassa açılışı özü çıxır (kassa bağlıdır)');
  await p.click('#ovKassa [data-close]');
  ok(await p.isVisible('#kzLockBar'), 'kassa açılmayıb: satış ekranında 🔒 xəbərdarlıq');
  await p.fill('#q', 'fincan termo'); await p.press('#q', 'Enter');
  ok(await p.isVisible('#ovKassa') && await p.evaluate(() => !order.length), 'kassa açılmadan məhsul əlavə olunmur — kassa pəncərəsi açılır');
  await p.fill('#kz_cnt', '50'); await p.click('[data-kz=open]');
  ok(await p.isHidden('#kzLockBar') && await p.evaluate(() => kzOpen()), 'Leyla kassanı açdı (50 ₼) — satış açıldı');
  ok(await p.evaluate(() => { S.kzReq = false; const r1 = !kzLocked(); S.kzReq = true; const r2 = kzLocked() === !kzOpen(); return r1 && r2; }), 'v1.2.0: açılış tələbi söndürüləndə kassir kilidlənmir');
  {const r = await p.evaluate(async () => {
    const saved = JSON.stringify(S.cash), td = dayKey(Date.now()); S.cash[td].log = [];
    CL.on = true; CL.cfg = {}; CL.pulled = false; kzWait = 0; kzSkip = ''; $('ovKassa').hidden = true; kzAuto();
    await new Promise(r => setTimeout(r, 1500)); const waited = $('ovKassa').hidden;
    S.kzReq = false; CL.pulled = true; await new Promise(r => setTimeout(r, 1300)); const noOpen = $('ovKassa').hidden;
    S.kzReq = undefined; kzAuto(); const shown = !$('ovKassa').hidden;
    S.kzReq = false; renderKzBtn(); const closed = $('ovKassa').hidden;
    delete S.kzReq; CL.on = false; CL.cfg = null; S.cash = JSON.parse(saved); renderKzBtn();
    return [waited, noOpen, shown, closed];
  });
  ok(r[0] && r[1], 'v1.8.1: bulud qoşuludursa kassa pəncərəsi buluddan ayar gələnə qədər gözləyir; "məcburi deyil" gəlsə açılmır');
  ok(r[2] && r[3], 'v1.8.1: pəncərə özü açılıb, sonra admin söndürdüyü xəbəri gəlib → pəncərə özü bağlanır');}
  ok(await p.evaluate(() => ['tip', 'payCard', 'paySplit', 'clearOrder'].every(k => me.perms[k] === 1)) && await p.isVisible('#payCard') && await p.isVisible('#btnTip'), 'v0.97.0: yeni kassirə Çay pulu, Kart, Nağd+Kart, Ləğv et icazələri standart açıq');
  await p.evaluate(() => { ['tip', 'payCard', 'paySplit', 'clearOrder'].forEach(k => me.perms[k] = 0); renderOrder(); });
  ok(await p.isHidden('#payCard') && await p.isHidden('#paySplit') && await p.isHidden('#btnClear') && await p.isHidden('#btnTip') && await p.isVisible('#payCash'), 'icazə götürüləndə Kart, Nağd+Kart, Ləğv et, Çay pulu gizlənir (Nağd qalır)');
  await p.evaluate(() => { ['tip', 'payCard', 'paySplit', 'clearOrder'].forEach(k => me.perms[k] = 1); renderOrder(); });

  // 5) Kassir: yalnız icazəli düymələr
  ok(await p.isVisible('#btnZay') && await p.isVisible('#btnHist'), 'Leyla: Zay və Tarixçə görünür');
  ok(await p.evaluate(() => !can('refund')), 'Leyla: Qaytar / Əvəzlə icazəsi standart bağlıdır');
  ok(await p.isHidden('#btnRep') && await p.isHidden('#btnSet') && await p.isVisible('#btnExp') && await p.isHidden('#btnEdit') && await p.isHidden('#today'), 'Leyla: Hesabat, Ayarlar, Düzəliş, günün cəmi gizlidir; Xərclər görünür (v0.61.0)');
  await sellOne(p);
  ok(JSON.parse(fs.data).sales.at(-1).worker === 'Leyla', 'satış Leyla-nın adına yazıldı');
  await p.click('#btnHist');
  ok(await p.locator('#hBody [data-h=ask]').count() === 0, 'Leyla satışı silə bilmir (Sil düyməsi yoxdur)');
  await p.click('#ovHist [data-close]');

  // 6) Nigar: günlük hesabat var, maya/mənfəət yoxdur
  await p.click('#btnUser'); await p.click(`[data-login="${nigar.id}"]`); await p.keyboard.type('3333'); await p.keyboard.press('Enter');
  ok(await p.isVisible('#btnRep') && await p.isHidden('#btnSet'), 'Nigar: Hesabat görünür, Ayarlar yox');
  await p.click('#btnRep');
  const tabs = await p.locator('#rbody [data-ks]').evaluateAll(b => b.map(x => x.dataset.ks));
  ok(tabs.join('|') === 'nağd|kart|borc|kassapul|artiq|zay', 'Nigar: Nağd, Kart, Nisyə, Artıq ödəmə, Zay qutuları (Xərclər, Anbar pulu, Mənfəət yox)');
  const rb = await p.textContent('#rbody');
  ok(rb.includes('Kassa') && !rb.includes('Satışdan qazanc') && !rb.includes('mayası'), 'Nigar: kassa görünür, maya və qazanc gizlidir');
  await p.click('#ovRep [data-close]');

  // 7) Yenidən açılış: admin PIN-i var → giriş ekranı; admin girir
  await p.close(); p = await open();
  ok(await p.isVisible('#ovLogin'), 'yenidən açılış: giriş ekranı çıxır');
  await p.click('#ovLogin', { position: { x: 5, y: 5 } });
  ok(await p.isVisible('#ovLogin'), 'giriş ekranı kənara basmaqla bağlanmır');
  await p.keyboard.press('Space'); await p.keyboard.press('Space');
  ok(JSON.parse(fs.data).sales.length === 4, 'giriş ekranında Space ilə satış olmur');
  await p.click(`[data-login="${adminId}"]`); await p.keyboard.type('1111'); await p.keyboard.press('Enter');
  ok(await p.isHidden('#ovLogin') && await p.isVisible('#btnSet'), 'admin PIN ilə girdi, hər şey görünür');
  await p.click('#btnSet'); await p.click('[data-rt=users]');
  await p.click(`[data-act=udel][data-id="${nigar.id}"]`); await p.click(`[data-act=udel][data-id="${nigar.id}"]`);
  ok(!JSON.parse(fs.data).users.some(u => u.id === nigar.id), 'admin kassiri sildi (iki addımla)');
  await p.click('[data-rt=backup]'); await p.waitForSelector('#blist table');
  ok((await p.textContent('#rbody')).includes('hər əməliyyatdan sonra') && (await p.textContent('#blist')).includes('əməliyyatdan sonra'), 'ehtiyat bölməsi: yeni qayda izah olunur, növ göstərilir');
  await p.click('[data-act=bkind][data-k=avto]');
  ok(await p.locator('#blist tr').count() === kinds('avto') + 1, 'süzgəc: yalnız gündəlik nüsxələr');

  await p.click('#ovRep [data-close]');

  // 8) 🚚 Tədarükçü: kassir yazır, xərclərə düşür, admin aylıq hesabatı görür
  ok(JSON.parse(fs.data).suppliers.map(x => x.name).join('|') === 'Samir Foto|Vəfa Foto|Samir Banner', 'v0.93.0: 3 tədarükçü (Şamil Vinetka silindi)');
  await p.click('#btnUser'); await p.click(`[data-login="${leyla}"]`); await p.keyboard.type('2222'); await p.keyboard.press('Enter');
  ok(await p.isHidden('#btnSupp') && await p.isVisible('#btnExp'), 'v0.93.0: soldakı 🚚 Tədarükçü düyməsi yoxdur, 💸 Xərclər görünür');
  await p.evaluate(() => openSupp());
  ok(await p.locator('#stabs .tab').count() === 0 && await p.locator('.stile').count() === 3, 'Leyla: yalnız alış yazmaq (hesabat tabı yoxdur), 3 tədarükçü');
  await p.click('.stile:has-text("Samir Foto")'); await p.click('[data-s=save]');
  ok((await p.textContent('#toast')).includes('məbləği yazın'), 'məbləğsiz yazılmır');
  await p.fill('#sl_s_0', '45.5'); await p.click('[data-s=save]');
  ok((await p.textContent('#toast')).includes('Malın adını'), 'malın adı olmadan yazılmır');
  await p.fill('#sl_n_0', 'Foto kağız 10x15'); await p.fill('#sl_q_0', '100'); await p.fill('#sl_s_0', '40');
  await p.click('[data-s=ladd]'); await p.fill('#sl_n_1', 'Çərçivə'); await p.fill('#sl_q_1', '1'); await p.fill('#sl_s_1', '5.5');
  ok((await p.textContent('#s_tot')).startsWith('45.50') && (await p.textContent('#sl_u_0')).includes('0.40'), 'cəmi özü hesablanır (45.50), 1 ədədin qiyməti görünür (0.40)');
  await p.press('#sl_s_1', 'Enter');
  await p.click('.stile:has-text("Samir Banner")'); await p.fill('#sl_n_0', 'Vinetka'); await p.fill('#sl_s_0', '20'); await p.click('[data-s=pay][data-p=kart]'); await p.click('[data-s=save]');
  const ex = JSON.parse(fs.data).expenses.filter(x => x.supp);
  ok(ex.length === 2 && ex[0].cat === 'Samir Foto' && ex[0].amount === 45.5 && ex[0].pay === 'nağd' && ex[0].worker === 'Leyla' && ex[1].pay === 'kart' && ex[0].lines.length === 2 && ex[0].note.includes('Foto kağız 10x15 ×100'), 'alışlar xərclərə tədarükçünün adı ilə düşdü (kim yazıb, ödəniş)');
  ok((await p.textContent('#suppBody')).includes('Foto kağız 10x15 ×100') && await p.locator('#suppBody [data-s=ask]').count() === 2, 'bu günün siyahısı, Leyla öz yazdığını silə bilər');
  await p.click('#ovSupp [data-close]');
  await p.click('#btnUser'); await p.click(`[data-login="${adminId}"]`); await p.keyboard.type('1111'); await p.keyboard.press('Enter');
  await p.evaluate(() => openSupp()); await p.click('[data-s=tab][data-t=rep]');
  const sr = await p.textContent('#suppBody');
  ok(sr.includes('65.50') && sr.includes('45.50') && sr.includes('Samir Foto') && sr.includes('20.00'), 'admin: aylıq hesabat — cəmi 65.50, Samir Foto 45.50, Samir Banner 20.00');
  ok(sr.includes('nə alınıb') && sr.includes('Foto kağız 10x15') && sr.includes('Çərçivə'), 'aylıq hesabatda "nə alınıb" cədvəli (mal-mal)');
  await p.click('[data-s=tab][data-t=list]');
  await p.fill('[data-sn=sp1]', 'Samir Foto Studio'); await p.dispatchEvent('[data-sn=sp1]', 'change');
  ok(JSON.parse(fs.data).expenses.find(x => x.supp === 'sp1').cat === 'Samir Foto Studio', 'ad dəyişəndə keçmiş alış da yeni adla');
  await p.fill('#s_new', 'Kamran Kağız'); await p.click('[data-s=sadd]');
  ok(JSON.parse(fs.data).suppliers.length === 4, 'admin yeni tədarükçü əlavə etdi');
  await p.click('#ovSupp [data-close]');
  await p.click('#btnRep'); await p.evaluate(() => repGo('kassapul'));
  ok((await p.textContent('#rbody')).includes('45.50'), 'nağd alış kassa hesabından çıxılır (− Nağd digər xərclər 45.50)');
  await p.evaluate(() => repGo('xerc'));
  ok((await p.textContent('#rbody')).includes('Samir Foto Studio'), 'aylıq mənfəət hesabatında xərc növü kimi görünür');
  await p.click('#ovRep [data-close]');

  // 9) Nisyə: borc tədarükçünün adına yazılır, hissə-hissə ödənir
  await p.evaluate(() => openSupp()); await p.click('[data-s=tab][data-t=add]');
  await p.click('.stile:has-text("Vəfa Foto")'); await p.fill('#sl_n_0', 'Foto albom'); await p.fill('#sl_s_0', '100'); await p.click('[data-s=pay][data-p=nisyə]');
  ok((await p.textContent('#suppBody')).includes('borc Vəfa Foto adına'), 'nisyə seçiləndə izah çıxır');
  await p.click('[data-s=save]');
  await p.click('.stile:has-text("Vəfa Foto")'); await p.fill('#sl_n_0', 'Foto albom'); await p.fill('#sl_s_0', '50'); await p.click('[data-s=pay][data-p=nisyə]'); await p.click('[data-s=save]');
  ok((await p.textContent('#suppBadge')).includes('150.00') && await p.isVisible('#suppBadge'), 'başlıqda borc nişanı: 150.00 ₼');
  ok(!(await p.textContent('#stabs')).includes('Borclar'), 'Tədarükçü pəncərəsində Borclar tabı yoxdur (💳 Borclar-a köçüb)');
  await p.click('#ovSupp [data-close]'); await p.click('#btnCust'); await p.click('[data-c=tab][data-t=sdebt]');
  ok((await p.textContent('#cdBody')).includes('Borc: 150.00'), '💳 Borclar → Bizim borclarımız: Vəfa Foto 150.00');
  await p.fill('#dp_sp2', '200'); await p.click('[data-s=dpay][data-id=sp2][data-by=nağd]');
  ok((await p.textContent('#toast')).includes('Borcdan çox'), 'borcdan çox ödəmək olmur');
  await p.fill('#dp_sp2', '60'); await p.click('[data-s=dpay][data-id=sp2][data-by=nağd]');
  ok((await p.textContent('#toast')).includes('qalan borc 90.00') && (await p.textContent('#suppBadge')).includes('90.00'), 'hissəli ödəniş: 60 ödəndi, qalan 90');
  await p.click('[data-s=dpay][data-id=sp2][data-by=kart]');
  ok((await p.textContent('#toast')).includes('borc bağlandı') && await p.isHidden('#suppBadge'), 'qalanı kartla ödəndi: borc bağlandı, nişan getdi');
  await p.click('#ovCDebt [data-close]');
  await p.click('#btnRep'); await p.evaluate(() => repGo('suppdebt'));
  ok((await p.textContent('#rbody')).includes('Bizim borcumuz') && (await p.textContent('#rbody')).includes('Vəfa Foto'), 'Hesabat → 💳 Borclar: baxış (tədarükçü üzrə)');
  await p.click('#ovRep [data-close]');
  await p.click('#btnRep'); await p.evaluate(() => repGo('kassapul'));
  ok((await p.textContent('#rbody')).includes('60.00'), 'nağd borc ödənişi (60) kassadan çıxılır');
  await p.click('#ovRep [data-close]');
  const months = JSON.parse(fs.data).expenses.filter(x => x.supp === 'sp2' && x.pay === 'nisyə').reduce((a, x) => a + x.amount, 0);
  ok(months === 150, 'nisyə alışlar xərc kimi alış günündə sayılır (150)');
  await p.click('#btnUser'); await p.click(`[data-login="${leyla}"]`); await p.keyboard.type('2222'); await p.keyboard.press('Enter');
  await p.evaluate(() => openSupp());
  ok(!(await p.textContent('#stabs')).includes('Borclar') && await p.isHidden('#suppBadge'), 'Leyla: borc icazəsi yoxdur — Borclar tabı və nişan görünmür');
  await p.click('#ovSupp [data-close]');

  // 10) 🏢 Müəssisəyə borca satış (Leyla hələ girişdədir)
  await sellOne(p); // nağd satış kimi davam edir
  await p.fill('#q', 'fincan termo'); await p.press('#q', 'Enter');
  ok(await p.isVisible('#payDebt'), 'Leyla: "📝 Borca" düyməsi görünür');
  await p.click('#payDebt');
  ok(await p.isVisible('#ovCust'), 'Borca: müəssisə seçmə pəncərəsi açıldı');
  await p.fill('#c_new', '45 saylı məktəb'); await p.click('[data-c=new]');
  ok(await p.isHidden('#ovCust') && (await p.textContent('#custSel')).includes('45 saylı məktəb') && (await p.textContent('#btnDone')).includes('Nisyəyə yaz'), 'müəssisə seçildi, düymə "Borca yaz ✓"');
  await p.click('#btnDone');
  let sl = JSON.parse(fs.data).sales.at(-1);
  ok(sl.pay === 'borc' && sl.custName === '45 saylı məktəb' && sl.total === 10 && sl.worker === 'Leyla', 'satış məktəbin borcuna yazıldı (10 ₼)');
  ok((await p.textContent('#btnDone')).includes('Ödənildi') && await p.isHidden('#custSel'), 'satışdan sonra yenə nağd rejiminə qayıdır');
  await p.fill('#q', 'fincan sade'); await p.press('#q', 'Enter'); await p.click('#payDebt'); await p.click('.ctile:has-text("45 saylı məktəb")'); await p.click('#btnDone');
  ok(await p.isHidden('#btnCust'), 'Leyla: borclular bölməsi görünmür (icazə yoxdur)');
  await p.click('#btnUser'); await p.click(`[data-login="${adminId}"]`); await p.keyboard.type('1111'); await p.keyboard.press('Enter');
  ok((await p.textContent('#custBadge')).includes('18.00'), 'admin: başlıqda borclular nişanı 18.00 ₼');
  await p.click('#btnHist');
  ok((await p.textContent('#hBody')).includes('Nisyə: 45 saylı məktəb'), 'tarixçədə "📝 Borca: 45 saylı məktəb"');
  await p.click('#ovHist [data-hp=borc]');
  ok(await p.locator('#hBody tr').count() === 3, 'tarixçə süzgəci: yalnız borca satışlar (2)');
  await p.click('#ovHist [data-close]');
  await p.click('#btnCust');
  const cid = JSON.parse(fs.data).customers[0].id;
  ok((await p.textContent('#cdBody')).includes('Borc: 18.00'), 'Borclular: məktəbin borcu 18.00');
  await p.fill(`#cp_${cid}`, '10'); await p.click(`[data-c=cpay][data-id="${cid}"][data-by=nağd]`);
  ok((await p.textContent('#toast')).includes('qalan borc 8.00'), 'hissəli pul alındı: 10, qalan 8');
  await p.click('#ovCDebt [data-close]');
  await p.click('#btnRep'); await p.evaluate(() => repGo('kassapul'));
  const g = await p.textContent('#rbody');
  ok(g.includes('Borclulardan alınan nağd') && g.includes('10.00'), 'kassa: borcludan alınan 10 ₼ nağd əlavə olunur');
  await p.click('#ovRep [data-close]');
  await p.click('#btnHist'); await p.click('#ovHist [data-hp=borc]'); await p.click('#hBody [data-h=ask] >> nth=0'); await p.click('#hBody [data-h=del]');
  await p.waitForTimeout(400);
  ok(JSON.parse(fs.data).sales.filter(s => s.pay === 'borc').length === 1, 'admin borca satışı silə bilir (ödənişdən artıq deyilsə)');
  await p.click('#ovHist [data-close]');

  // 11) Samir Foto qiymət siyahısı: düyməyə bas → say → məbləğ özü
  await p.evaluate(() => openSupp()); await p.click('[data-s=tab][data-t=add]'); await p.click('.stile:has-text("Samir Foto")');
  ok(await p.locator('.plist button').count() === 7 && (await p.textContent('.plist')).includes('Foto 15x21') && (await p.textContent('.plist')).includes('0.45'), 'Samir Foto: 7 mallıq qiymət siyahısı (15x21 — 0.45)');
  await p.click('.plist button:has-text("Foto 10x15")'); await p.fill('#sl_q_0', '200'); await p.dispatchEvent('#sl_q_0', 'input');
  ok((await p.inputValue('#sl_s_0')) === '60.00', '10x15 × 200 = 60.00 (0.30-dan)');
  await p.click('.plist button:has-text("Foto 20x25")'); await p.click('.plist button:has-text("Foto 20x25")');
  ok((await p.inputValue('#sl_q_1')) === '2' && (await p.inputValue('#sl_s_1')) === '4.00' && (await p.textContent('#s_tot')).startsWith('64.00'), 'eyni mala iki dəfə basmaq sayı artırır: 20x25 × 2 = 4.00, cəmi 64.00');
  await p.click('[data-s=save]');
  ok(JSON.parse(fs.data).expenses.at(-1).note.startsWith('Foto 10x15 ×200, Foto 20x25 ×2'), 'alış mal-mal yazıldı');
  await p.click('[data-s=tab][data-t=list]'); await p.click('[data-s=pled][data-id=sp1]');
  await p.fill('[data-pp="sp1|pi1"]', '0.35'); await p.dispatchEvent('[data-pp="sp1|pi1"]', 'change');
  await p.fill('#pl_n', 'Foto 30x40'); await p.fill('#pl_p', '6'); await p.click('[data-s=pladd][data-id=sp1]');
  const sf = JSON.parse(fs.data).suppliers.find(x => x.id === 'sp1');
  ok(sf.items[0].price === 0.35 && sf.items.length === 8, 'admin qiyməti dəyişdi (0.35) və yeni mal əlavə etdi');
  await p.click('#ovSupp [data-close]');

  // 12) Foto: özümüz / Samir Foto — satış ayrı yazılır, aylıq hesabatda ayrılır
  await p.fill('#q', '15x21'); await p.press('#q', 'Enter');
  ok(await p.isVisible('#ovSrc'), 'axtarış + Enter: 15x21 üçün mənbə soruşulur');
  await p.keyboard.press('1');
  await p.fill('.line input', '10'); await p.dispatchEvent('.line input', 'change');
  await p.click('#qClear'); await p.fill('#q', '15x21'); await p.press('#q', 'Enter'); await p.keyboard.press('2');
  await p.fill('#lines .line:nth-child(2) input', '20'); await p.dispatchEvent('#lines .line:nth-child(2) input', 'change');
  await p.click('#btnDone');
  const ls = JSON.parse(fs.data).sales.at(-1).lines;
  ok(ls.length === 2 && !ls[0].from && ls[1].from === 'sp1' && ls[1].cost === 0 && Math.abs(ls[1].scost - 9) < 1e-9 && ls[1].sum === 20, 'satış: özümüz 10 əd + Samir 20 əd (alış 20×0.45=9, maya 0)');
  { const D = JSON.parse(fs.data), sid = D.sales.at(-1).id, ax = D.expenses.find(x => x.auto && x.sale === sid);
    ok(ax && ax.supp === 'sp1' && ax.pay === 'nisyə' && Math.abs(ax.amount - 9) < 1e-9 && ax.note.includes('×20'), 'v0.92.0: Samir Foto seçilən satış → Samir Foto-ya 9 ₼ nisyə borc avtomatik yazıldı'); }
  // v0.93.0: Vəfa Foto — ikinci tədarükçü, nağd ödənir
  ok(await p.evaluate(() => srcList(item('fk_1521')).map(x => x.sp.name).join('|') === 'Samir Foto Studio|Vəfa Foto'), '15x21: tədarükçülər Samir Foto və Vəfa Foto');
  await p.evaluate(() => { const v = S.suppliers.find(x => x.id === 'sp2'); v.items.find(y => y.name === 'Foto 15x21').price = 0.4; save(); });
  await p.click('#qClear'); await p.fill('#q', '15x21'); await p.press('#q', 'Enter');
  ok((await p.textContent('#srcBody')).includes('Vəfa Foto') && (await p.textContent('#srcBody')).includes('klaviatura: 3'), 'seçim pəncərəsində 3 düymə: Özümüz / Samir / Vəfa');
  await p.keyboard.press('3'); await p.click('#btnDone');
  { const D = JSON.parse(fs.data), sl = D.sales.at(-1), vx = D.expenses.find(x => x.auto && x.sale === sl.id);
    ok(sl.lines[0].from === 'sp2' && vx && vx.pay === 'alver' && Math.abs(vx.amount - 0.4) < 1e-9, 'Vəfa Foto satışı: alış 0.40 ₼ "öz cibimdən" xərc kimi yazıldı (borca da, kassaya da yox)'); }
  ok(await p.evaluate(() => { const d = dayKey(Date.now()), e1 = cashDay(d).exp; return S.expenses.some(x => x.pay === 'alver') && e1 === S.expenses.filter(x => dayKey(x.ts) === d && x.pay === 'nağd').reduce((a, x) => a + x.amount, 0); }), 'cibdən ödənən xərc kassa hesabından çıxılmır');
  await p.click('#btnRep'); await p.evaluate(() => repGo('suppdebt'));
  ok((await p.textContent('#rbody')).includes('Satışdan (avtomatik)'), 'Hesabat → 🚚 Bizim borclarımız: satışdan yazılan borc görünür');
  await p.click('#ovRep [data-close]');
  await p.click('#btnRep'); await p.evaluate(() => repGo('xerc'));
  const mr = await p.textContent('#rbody');
  ok(mr.includes('özümüz çap etdik') && mr.includes('Samir Foto Studio: satış') && mr.includes('11.00'), 'aylıq: Samir Foto-dan satış 20, alış qiyməti 9, qazanc 11');
  await p.evaluate(() => repGo('kassapul')); await p.evaluate(() => repGo('nağd'));
  ok((await p.textContent('#rbody')).includes('15x21 · 🚚 Samir Foto') && (await p.textContent('#rbody')).includes('15x21 · 🖨 özümüz'), 'Məhsul + mənfəət: 15x21 iki ayrı sətir');
  await p.click('#ovRep [data-close]');

  await p.evaluate(() => document.querySelectorAll('.ov').forEach(o => o.hidden = true));
  await p.click('#btnSet'); await p.click('[data-rt=supp]');
  ok((await p.textContent('#rbody')).includes('Samir Banner') && await p.locator('#rbody [data-sad=sp2]').inputValue() === 'alver' && await p.locator('#rbody [data-sad=sp4]').inputValue() === 'alver' && await p.locator('#rbody [data-sad=sp1]').inputValue() === 'nisyə', 'Ayarlar → 🚚 Tədarükçülər: Samir Foto borca, Vəfa və Samir Banner öz cibimdən');
  await p.click('#rbody [data-s=pled][data-id=sp2]');
  ok((await p.textContent('#rbody')).includes('alış qiymətləri'), 'Ayarlar-da 💲 Qiymətlər açılır');
  await p.click('#ovRep [data-close]');
  // 13) Banner / Vinil: m² ilə, qiymət hər sifarişdə; həmişə Samir Banner-dən
  const sb = JSON.parse(fs.data).suppliers.find(x => x.id === 'sp4');
  ok(sb.items.map(x => x.name + ':' + x.price).join('|') === 'Banner (1 m²):6|Vinil (1 m²):6', 'Samir Banner: Banner və Vinil 1 m² — 6 ₼');
  await p.fill('#q', 'banner'); await p.press('#q', 'Enter');
  ok(await p.isVisible('#ovM2') && await p.isHidden('#ovSrc'), 'Banner: ölçü/qiymət pəncərəsi açılır (Özümüz/Samir sualı yoxdur)');
  await p.click('[data-m2=add]');
  ok((await p.textContent('#toast')).includes('Ölçünü yazın'), 'ölçüsüz əlavə olunmur');
  await p.fill('#m2_w', '3'); await p.fill('#m2_h', '1,5');
  ok((await p.textContent('#m2_area')).includes('4,5 m²'), '3 × 1,5 = 4,5 m²');
  await p.fill('#m2_pm', '12');
  ok((await p.inputValue('#m2_tot')) === '54.00' && (await p.textContent('#m2_sum')).includes('27.00') && (await p.textContent('#m2_sum')).includes('27.00 ₼'), '1 m² 12 → cəmi 54; Samir: 4,5 × 6 = 27, qazanc 27');
  await p.fill('#m2_tot', '50');
  ok((await p.inputValue('#m2_pm')) === '11.11', 'cəmi 50 yazanda 1 m² qiyməti özü: 11.11');
  await p.keyboard.press('Enter');
  ok(await p.isHidden('#ovM2') && (await p.textContent('#lines')).includes('3 × 1,5 m (4,5 m²)') && (await p.textContent('#total')).startsWith('50.00'), 'sifarişdə: Banner 3 × 1,5 m (4,5 m²) — 50.00');
  await p.click('#qClear'); await p.fill('#q', 'vinil'); await p.press('#q', 'Enter');
  ok((await p.textContent('#m2t')).includes('Vinil'), 'axtarış "vinil" + Enter: Vinil açılır (Banner yox)');
  await p.click('[data-m2=mode][data-k=a]'); await p.fill('#m2_a', '2'); await p.fill('#m2_n', '3'); await p.fill('#m2_pm', '10'); await p.click('[data-m2=add]');
  ok((await p.textContent('#total')).startsWith('110.00'), 'Vinil 2 m² × 3 ədəd × 10 = 60; cəmi 110');
  await p.click('#btnDone');
  const bl = JSON.parse(fs.data).sales.at(-1).lines;
  ok(bl[0].from === 'sp4' && bl[0].cost === 0 && bl[0].scost === 27 && bl[0].sum === 50 && bl[1].m2 === 6 && bl[1].scost === 36, 'satış: Samir Banner işi, alış dəyəri (27 və 36), maya 0');
  await p.click('#btnRep'); await p.evaluate(() => repGo('xerc'));
  const br = await p.textContent('#rbody');
  ok(br.includes('Samir Banner: satış') && br.includes('110.00') && br.includes('47.00') && br.includes('Banner (m²)'), 'aylıq: Samir Banner satış 110, qazanc 47, Banner (m²) sətri');
  await p.click('#ovRep [data-close]');

  // v1.9.0: bütün funksiyalar ayrıca icazə ilə
  {const r = await p.evaluate(() => {
    const sv = me, out = {};
    S.users.push({ id: 'uMig', name: 'Köhnə Kassir', role: 'kassir', perms: { reports: 1, cost: 1, delSale: 1, exp: 1, stock: 1 } }); upgrade();
    const P = S.users.find(u => u.id === 'uMig').perms;
    out.mig = ['rb_nagd', 'rb_kart', 'rb_nisye', 'rb_kassapul', 'rb_artiq', 'rb_zay', 'rb_xerc', 'rb_anbarpul', 'rb_menfeet', 'payEdit', 'expBuy', 'expOther', 'expDebt', 'expDel', 'stockMat', 'free', 'kassa', 'upd'].every(k => P[k] === 1) && P._v2 === 1 && !P.exp;
    S.users = S.users.filter(u => u.id !== 'uMig');
    me = { id: 'kz', name: 'Boş Kassir', role: 'kassir', perms: {} }; applyPerms();
    order = []; tapItem('vit_mal'); out.free = !order.length && $('ovM2').hidden && $('toast').textContent.includes('icazəniz yoxdur');
    out.kassa = !kzLocked() && $('btnKassa').hidden;
    out.btns = $('btnExp').hidden && $('btnStock').hidden && $('btnRep').hidden;
    me = { id: 'kz', name: 'Boş Kassir', role: 'kassir', perms: { expOther: 1 } }; applyPerms(); openExp();
    out.exp = etab === 'other' && document.querySelectorAll('#etabs .tab').length === 1; $('ovExp').hidden = true;
    me.perms = { stock: 1 }; out.stock = stockTabs().map(x => x[0]).join() === 'anbar,low';
    me.perms = { rb_xerc: 1 }; applyPerms(); out.rep = !$('btnRep').hidden; mode = 'rep'; kSub = ''; renderRep();
    out.repBoxes = [...document.querySelectorAll('#rbody [data-ks]')].map(x => x.dataset.ks).join() === 'xerc' && !document.querySelector('#rbody .kpi.hero');
    me = sv; applyPerms(); return out;
  });
  ok(r.mig, 'v1.9.0: köhnə kassirin icazələri yeni qutulara köçür (heç nə itmir), köhnə "exp" silinir');
  ok(r.free && r.kassa && r.btns, 'v1.9.0: icazəsi olmayan kassir: sərbəst qiymətli düymə satılmır, Kassa düyməsi yox və kilidlənmir, Xərclər/Anbar/Hesabat yox');
  ok(r.exp && r.stock, 'v1.9.0: Xərclər yalnız icazəli tab (Digər xərclər), Anbar: Materiallar tabı ayrıca icazə ilə');
  ok(r.rep && r.repBoxes, 'v1.9.0: yalnız "Xərclər" qutusu icazəlidirsə Hesabatda yalnız o qutu görünür');}

  // v1.10.1 audit
  {const r = await p.evaluate(() => {
    const out = {}, it = S.items.find(i => !i.group && !i.free && !i.area && i.tiers.some(t => +t[1]));
    order = []; addItem(it.id, 1); const c = S.customers[0] || addCust('Audit MMC'); ordCust = c.id; pay = 'borc'; renderOrder();
    document.getElementById('btnClear').click(); out.clear = pay === 'nağd' && ordCust === null && !order.length;
    const n = S.sales.length; order = []; finishSale(); out.empty = S.sales.length === n;
    const M = S.materials[0], st = M.stock, co = M.cost; S.purchases.push({ id: 'puA', ts: Date.now(), supplier: '', pay: 'nağd', paid: false, worker: curName(), lines: [{ mat: M.id, name: M.name, qty: M.stock + 5, total: 10 }], total: 10 });
    M.stock += 0; deletePurchase('puA'); out.cost = Number.isFinite(M.cost); M.stock = st; M.cost = co;
    return out;
  });
  ok(r.clear, 'v1.10.1: "Sifarişi ləğv et" Nisyə müştərisini və ödəniş növünü də sıfırlayır');
  ok(r.empty, 'v1.10.1: boş sifarişdə satış yazılmır');
  ok(r.cost, 'v1.10.1: köhnə alış (əvvəlki maya yazılmayıb) silinəndə maya pozulmur');}

  // v1.10.2: yeni xərc növü "Növ" siyahısının yanında
  await p.evaluate(() => { document.querySelectorAll('.ov').forEach(o => o.hidden = true); openExp(); etab = 'other'; renderExp(); });
  await p.click('[data-x=xcatnew]'); await p.fill('#x_newcat', 'Sifarişli çərçivə'); await p.keyboard.press('Enter');
  ok(await p.evaluate(() => S.expCats.includes('Sifarişli çərçivə') && $('x_cat').value === 'Sifarişli çərçivə' && !$('x_newcat')), 'v1.10.2: "＋ Yeni növ" ilə əlavə olunur və seçilir');
  await p.evaluate(() => document.querySelectorAll('.ov').forEach(o => o.hidden = true));

  // v1.10.3: xərc növünün adını dəyişmək / silmək (admin)
  await p.evaluate(() => { document.querySelectorAll('.ov').forEach(o => o.hidden = true); S.expCats.splice(S.expCats.length - 1, 0, '50x70 Sadə Yastı Qara');
    S.expenses.push({ id: 'xRen', ts: Date.now(), cat: '50x70 Sadə Yastı Qara', amount: 7, pay: 'nağd', note: '', rec: null, worker: curName() });
    openExp(); etab = 'other'; ed.cat = '50x70 Sadə Yastı Qara'; renderExp(); });
  await p.click('[data-x=xcatren]'); await p.fill('#x_newcat', 'Sifarişli çərçivə 2'); await p.keyboard.press('Enter');
  ok(await p.evaluate(() => S.expCats.includes('Sifarişli çərçivə 2') && !S.expCats.includes('50x70 Sadə Yastı Qara') && S.expenses.find(x => x.id === 'xRen').cat === 'Sifarişli çərçivə 2'), 'v1.10.3: növün adı dəyişdi, köhnə xərc də yeni adla');
  await p.click('[data-x=xcatdel]');
  ok(await p.evaluate(() => S.expCats.includes('Sifarişli çərçivə 2')) && (await p.textContent('#toast')).includes('silmək olmaz'), 'v1.10.3: xərc yazılmış növ silinmir');
  await p.evaluate(() => { S.expCats.splice(S.expCats.length - 1, 0, 'Boş növ'); ed.cat = 'Boş növ'; renderExp(); });
  await p.click('[data-x=xcatdel]'); await p.click('[data-x=xcatdel]');
  ok(await p.evaluate(() => !S.expCats.includes('Boş növ')), 'v1.10.3: boş növ iki kliklə silinir');
  await p.evaluate(() => { ed.cat = 'Digər'; renderExp(); });
  ok(!(await p.$('[data-x=xcatren]')), 'v1.10.3: "Digər" növünü dəyişmək olmur');
  await p.evaluate(() => { S.expenses = S.expenses.filter(x => x.id !== 'xRen'); S.expCats = S.expCats.filter(c => c !== 'Sifarişli çərçivə 2'); document.querySelectorAll('.ov').forEach(o => o.hidden = true); });

  // v1.10.5: növ seçiləndə siyahı yenidən çəkilmir (Windows-da açıq siyahıda seçim itirdi)
  await p.evaluate(() => { document.querySelectorAll('.ov').forEach(o => o.hidden = true); S.expCats.splice(S.expCats.length - 1, 0, '50x70 Çərçivə (Sadə Yastı Qara)'); openExp(); etab = 'other'; ed.cat = 'Maaş'; renderExp(); $('x_cat').dataset.mark = '1'; });
  await p.selectOption('#x_cat', '50x70 Çərçivə (Sadə Yastı Qara)');
  ok(await p.evaluate(() => ed.cat === '50x70 Çərçivə (Sadə Yastı Qara)' && $('x_cat').dataset.mark === '1' && !!document.querySelector('[data-x=xcatren]')), 'v1.10.5: növ seçilir, siyahı yerində qalır, Adını dəyiş düyməsi görünür');
  await p.fill('#x_amt', '105'); await p.click('[data-x=xsave]');
  ok(await p.evaluate(() => S.expenses.some(x => x.cat === '50x70 Çərçivə (Sadə Yastı Qara)' && x.amount === 105)), 'v1.10.5: xərc seçilən növlə yazılır');
  await p.evaluate(() => { S.expenses = S.expenses.filter(x => x.cat !== '50x70 Çərçivə (Sadə Yastı Qara)'); S.expCats = S.expCats.filter(c => c !== '50x70 Çərçivə (Sadə Yastı Qara)'); document.querySelectorAll('.ov').forEach(o => o.hidden = true); });

  // v1.10.6: adında iki boşluq olan növ (sahibinin videosu: Sil basanda siyahı "Maaş"a qayıdırdı)
  {const r = await p.evaluate(() => { document.querySelectorAll('.ov').forEach(o => o.hidden = true);
    S.expCats.splice(S.expCats.length - 1, 0, 'Test  İki Boşluq '); S.expenses.push({ id: 'xWs', ts: Date.now(), cat: 'Test  İki Boşluq ', amount: 1, pay: 'nağd', note: '', rec: null });
    openExp(); etab = 'other'; ed.cat = 'Test  İki Boşluq '; renderExp(); const shown = $('x_cat').value === ed.cat;
    delete S.mig.expCatWs; upgrade(); const clean = S.expCats.includes('Test İki Boşluq') && S.expenses.find(x => x.id === 'xWs').cat === 'Test İki Boşluq';
    S.expenses = S.expenses.filter(x => x.id !== 'xWs'); S.expCats = S.expCats.filter(c => c !== 'Test İki Boşluq'); document.querySelectorAll('.ov').forEach(o => o.hidden = true);
    return shown && clean; });
  ok(r, 'v1.10.6: artıq boşluqlu növ siyahıda düz seçilir; köhnə adlar bir dəfə təmizlənir');}

  // v1.11.0: "👛 Öz cibimdən" → "🏪 Ümumi alverdən" (pay:"alver"), Hesabat qutusu 🏪 Alver və xərclər
  {const r = await p.evaluate(() => { document.querySelectorAll('.ov').forEach(o => o.hidden = true);
    const bak = JSON.stringify({sales: S.sales, expenses: S.expenses, purchases: S.purchases, suppPays: S.suppPays, custPays: S.custPays});
    S.expenses.push({ id: 'xCib', ts: Date.now(), cat: 'Digər', amount: 7, pay: 'cib', note: 'köhnə', rec: null });
    delete S.mig.cibToAlver; upgrade(); const mig = S.expenses.find(x => x.id === 'xCib').pay === 'alver';
    openExp(); etab = 'other'; ed = null; renderExp(); const defAlver = ed.pay === 'alver';
    const btn = !!document.querySelector('#ovExp [data-x][data-v="alver"], #ovExp [data-p="alver"], #ovExp [data-pay="alver"]') || /Ümumi alverdən/.test($('ovExp').textContent);
    const noCib = !/Öz cibimdən/.test($('ovExp').textContent);
    document.querySelectorAll('.ov').forEach(o => o.hidden = true);
    const now = Date.now(); S.sales = [{ id: 'sA', ts: now, pay: 'nağd', total: 100, sub: 100, lines: [] }, { id: 'sB', ts: now, pay: 'kart', total: 50, sub: 50, lines: [] }];
    S.expenses = [{ id: 'e1', ts: now, cat: 'İcarə', amount: 30, pay: 'alver' }, { id: 'e2', ts: now, cat: 'Digər', amount: 5, pay: 'nisyə' }];
    S.purchases = [{ id: 'p1', ts: now, supplier: 'X', pay: 'alver', total: 20, lines: [{ name: 'Çərçivə', qty: 2 }] }]; S.suppPays = [{ id: 'y1', supp: 'sp1', ts: now, amount: 10, by: 'alver' }]; S.custPays = [];
    mode = 'rep'; rtab = 'kassa'; kSub = ''; $('ovRep').hidden = false; rrSet('today'); repGo('alver'); const txt = $('rbody').textContent;
    const ok2 = /150[.,]00 ₼/.test(txt) && /60[.,]00 ₼/.test(txt) && /90[.,]00 ₼/.test(txt) && /İcarə/.test(txt) && /Mal alışı/.test(txt);
    const cashOk = cashDay(dayKey(now)).exp === 0 && cashDay(dayKey(now)).purch === 0;
    repGo(''); document.querySelectorAll('.ov').forEach(o => o.hidden = true);
    Object.assign(S, JSON.parse(bak)); return [mig, btn, noCib, defAlver, ok2, cashOk]; });
  ok(r.every(Boolean), 'v1.11.0: cib→alver köçürmə, düymə, Alver və xərclər hesabatı (150 alver − 60 = 90), kassaya toxunmur ' + JSON.stringify(r));}

  // v1.11.1: Vəfa Foto qiymətləri, 30x40/30x42/30x45 Vəfa-ya qoşulur
  ok(await p.evaluate(() => { const vf = S.suppliers.find(x => x.id === 'sp2'); if (!vf) return true; const pr = n => vf.items.find(y => y.name.includes(n))?.price;
    const b = S.items.find(i => i.parent === 'g_foto' && i.name.includes('30x42')); return pr('10x15') === 0.4 && pr('25x38') === 3 && pr('30x45') === 5 && pr('25x30') === 3 && (!b || srcFind(b, vf.id)?.si?.price === 4.5); }), 'v1.11.1: Vəfa Foto qiymətləri yazıldı, 30x42 düyməsi Vəfa-ya qoşuldu');
  ok(await p.evaluate(() => { const it = S.items.find(i => i.parent === 'g_foto' && i.name === '25x30'); return !S.items.some(i => i.id === 'g_foto') || (it && it.tiers[0][1] === 6 && srcList(it).map(x => x.sp.id + ':' + x.si?.price).join(',') === 'sp1:4,sp2:3'); }), 'v1.11.3: Foto Kağızlar-da 25x30 — 6 ₼, Samir 4 / Vəfa 3');
  // v1.12.0: kassir başlıqda öz faizini görür (icazə myComm + İşçi faizi siyahısında)
  {const r = await p.evaluate(() => { const bakU = JSON.stringify(S.users), bakC = JSON.stringify(S.comm || null), bakS = S.sales.length, meB = me;
    S.users.push({ id: 'kF1', name: 'Faiz1', role: 'kassir', perms: { ...KASSIR_DEFAULT } }, { id: 'kF2', name: 'Faiz2', role: 'kassir', perms: { ...KASSIR_DEFAULT } });
    S.comm = { users: ['kF1', 'kF2'], rates: {} }; S.kzReq = false; me = S.users.find(u => u.id === 'kF1');
    const off = myCommMonth() === null; me.perms.myComm = 1; const v0 = myCommMonth().v;
    S.sales.push({ id: 'sF', ts: Date.now(), pay: 'nağd', total: 20, sub: 20, lines: [{ id: 'a4s_100', q: 40, sum: 20 }] });
    const v1 = myCommMonth().v; applyPerms(); renderAll(); const shown = /Faizim/.test($('today').textContent) && !$('today').hidden;
    S.sales = S.sales.filter(x => x.id !== 'sF'); S.users = JSON.parse(bakU); S.comm = JSON.parse(bakC); me = meB; applyPerms(); renderAll();
    return [off, Math.abs(v1 - v0 - 0.5) < 1e-9, shown]; });
  ok(r.every(Boolean), 'v1.12.0: icazəsiz görünmür; 20 ₼ × 5% / 2 işçi = +0.50 ₼; başlıqda görünür ' + JSON.stringify(r));}
  // v1.13.0: Sadə CV 3 / Müasir CV 5, satışda 1 vərəq A4 80 qram
  {const r = await p.evaluate(() => { const bakM = JSON.stringify(S.materials), bakI = JSON.stringify(S.items), bakS = S.sales.length; S.kzReq = false;
    const a = S.items.find(i => i.id === 'pq_cv_sade'), b = S.items.find(i => i.id === 'pq_cv_muasir'); if (!a || !b) return ['yox'];
    S.items.filter(i => i.id.startsWith('pq_cv')).forEach(i => i.recipe = []); const m = { id: 'mA4t', name: 'A4 Sadə 80 qram', unit: 'vərəq', stock: 100, cost: 0.011, min: 0 }; S.materials.push(m); upgrade();
    order = []; addItem('pq_cv_sade', 1); addItem('pq_cv_muasir', 2); pay = 'nağd'; finishSale(); const st = S.materials.find(x => x.id === 'mA4t').stock, tot = S.sales.at(-1).total;
    S.sales.length = bakS; S.materials = JSON.parse(bakM); S.items = JSON.parse(bakI); return [a.tiers[0][1] === 3 && b.tiers[0][1] === 5, st === 97, tot === 13]; });
  ok(r.every(x => x === true), 'v1.13.0: Sadə CV 3 / Müasir CV 5, 3 CV = 3 vərəq A4 silindi, cəmi 13 ' + JSON.stringify(r));}
  // v1.14.0: A3 Sadə kağızı A3 düymələrinə 1 vərəq, laminasiya A3 plyonkası qoşulmur
  {const r = await p.evaluate(() => { const bakM = JSON.stringify(S.materials), bakI = JSON.stringify(S.items), bakS = S.sales.length; S.kzReq = false;
    const ids = S.items.filter(i => i.parent === 'g_a3' && !i.group).map(i => i.id); if (!ids.length) return ['yox'];
    S.items.filter(i => i.parent === 'g_a3').forEach(i => i.recipe = []);
    S.materials.push({ id: 'mA3t', name: 'A3 Sadə', unit: 'vərəq', stock: 50, cost: 0.05, min: 0 }, { id: 'mLA3', name: 'Laminasiya A3 plyonka', unit: 'ədəd', stock: 10, cost: 0.2, min: 0 }); upgrade();
    order = []; ids.forEach(id => addItem(id, 2)); pay = 'nağd'; finishSale();
    const st = S.materials.find(x => x.id === 'mA3t').stock, lam = S.items.filter(i => i.parent === 'g_a3').some(i => i.recipe.some(([m]) => m === 'mLA3'));
    S.sales.length = bakS; S.materials = JSON.parse(bakM); S.items = JSON.parse(bakI); return [st === 50 - 2 * ids.length, !lam]; });
  ok(r.every(x => x === true), 'v1.14.0: A3 düymələri satılanda A3 Sadə kağızı silinir, A3 plyonka qoşulmur ' + JSON.stringify(r));}
  // v1.15.0: admin üçün göstərici çarx (satış − xərclər = xalis mənfəət), kassirdə fotoaparat
  {const r = await p.evaluate(() => { document.querySelectorAll('.ov').forEach(o => o.hidden = true); const meB = me, bS = S.sales.length, bE = S.expenses.length;
    me = S.users.find(u => u.role === 'admin'); const w0 = wheelStats();
    S.sales.push({ id: 'wT', ts: Date.now(), pay: 'nağd', total: 100, sub: 100, lines: [{ id: 'x', q: 1, sum: 100, cost: 30 }] }); S.expenses.push({ id: 'wX', ts: Date.now(), cat: 'Digər', amount: 20, pay: 'alver' });
    const w1 = wheelStats(); renderAll(); const adm = !$('wheel').hidden && $('camImg').hidden;
    const k = S.users.find(u => u.role !== 'admin'); let kas = true; if (k) { me = k; renderAll(); kas = $('wheel').hidden && !$('camImg').hidden; }
    S.sales.length = bS; S.expenses.length = bE; me = meB; renderAll();
    return [Math.abs((w1.sales - w0.sales) - 100) < 1e-9, Math.abs((w1.spent - w0.spent) - 50) < 1e-9, Math.abs(w1.net - (w1.sales - w1.spent)) < 1e-9, adm, kas]; });
  ok(r.every(Boolean), 'v1.15.0: çarx — satış +100, xərclər +50 (maya 30 + xərc 20), xalis = satış − xərclər; admin görür, kassir yox ' + JSON.stringify(r));}
  // v1.16.0: Sublim → Maqnit qrupu, 4 maqnit düyməsi (v1.16.1), anbardan 1 ədəd
  {const r = await p.evaluate(() => { const bM = JSON.stringify(S.materials), bI = JSON.stringify(S.items), bS = S.sales.length; S.kzReq = false;
    const g = S.items.find(i => i.id === 'g_maqnit'), it = S.items.find(i => i.id === 'mq_7575'); if (!g || !it) return ['yox'];
    it.recipe = []; S.materials.push({ id: 'mMq', name: 'Maqnit Kvadrat 75x75', unit: 'ədəd', stock: 20, cost: 0.8, min: 0 }, { id: 'mMu', name: 'Maqnit Sublim Ürək', unit: 'ədəd', stock: 5, cost: 1, min: 0 }); upgrade();
    order = []; addItem('mq_7575', 3); pay = 'nağd'; finishSale(); const st = S.materials.find(x => x.id === 'mMq').stock, tot = S.sales.at(-1).total;
    const names = S.items.filter(i => i.parent === 'g_maqnit').map(i => i.name + ':' + i.tiers[0][1]).join('|'), urek = S.items.find(i => i.id === 'mq_urek').recipe.map(r => r[0]).join();
    S.sales.length = bS; S.materials = JSON.parse(bM); S.items = JSON.parse(bI); return [g.group === 1, it.parent === 'g_maqnit', st === 17, tot === 7.5, names === 'Maqnit Sublim Ürək 95x100:3|Maqnit Sublim Ürək 75x75:2.5|Maqnit Sublim Yumru 75x75:2.5|Maqnit Sublim Kvadrat 75x75:2.5|Maqnit Sublim Düzbucaq 55x90:3', urek === 'mMu']; });
  ok(r.every(x => x === true), 'v1.16.1: Maqnit — 4 düymə, Kvadrat 2.50 × 3 = 7.50, öz malından silinir, Ürək öz malına ' + JSON.stringify(r));}
  ok(errs.length === 0, 'JS xətası yoxdur ' + errs.join('; '));
  await b.close();
})();
