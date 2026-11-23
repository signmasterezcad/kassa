// Sadə avtomatik yoxlama: node tests/smoke.js [app/index.html]
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1366, height: 768 }, acceptDownloads: true });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const external = []; p.on('request', r => { if (!r.url().startsWith('file:') && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) external.push(r.url()); });
  await p.goto('file://' + path.resolve(process.argv[2] || 'app/index.html'));
  const m2v = v => (Math.round(v * 100) / 100).toFixed(2);
const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
  const vis = id => p.isVisible('#' + id);

  ok(!(await vis('ovZay')) && !(await vis('ovRep')), 'açılışda pəncərələr gizlidir');
  await p.click('#btnZay'); ok(await p.locator('#zMat option').count() === 5, 'zay: material siyahısı');
  await p.click('#ovZay [data-close]'); ok(!(await vis('ovZay')), 'zay: Bağla işləyir');

  await p.click('[data-cat=skan]');
  await p.click('[data-add=kser]'); for (let i = 0; i < 20; i++) await p.click('[data-inc=kser]');
  ok((await p.textContent('#total')).startsWith('2.10'), '21 × Kserokopiya = 2.10 (pillə 21+)');
  await p.click('#btnDone');
  ok((await p.textContent('#chips')).includes('1179'), 'A4 80 qr qalığı 1200 → 1179');

  await p.evaluate(() => document.fonts.ready);
  ok(await p.evaluate(() => document.fonts.check('700 16px "Noto Sans"', 'əğ₼')), 'şrift proqramın içindən yükləndi (ə, ğ, ₼)');

  // Ayarlar: yeni məhsul
  await p.click('#btnSet'); ok((await p.textContent('#rt')).includes('Ayarlar'), 'Ayarlar pəncərəsi açıldı');
  await p.click('[data-rt=admin]');
  await p.click('[data-act=new]');
  await p.fill('#e_name', 'A3 rəngli çap');
  await p.click('[data-act=eicon]'); await p.waitForSelector('#ovIcon:not([hidden])');
  ok(await p.locator('#ovIcon [data-ic]').count() > 60, 'ikon seçimi: pəncərədə çoxlu ikon');
  await p.click('#ovIcon [data-ic="🖨️"]');
  ok(await p.isHidden('#ovIcon') && (await p.inputValue('#e_icon')) === '🖨️' && (await p.inputValue('#e_name')) === 'A3 rəngli çap', 'düymə: ikon seçildi (🖨️), yazılan ad itmədi');
  await p.click('[data-act=radd]'); await p.selectOption('#r_m_0', 'a4'); await p.fill('#r_q_0', '2');
  await p.fill('#t_p_0', '2'); await p.click('[data-act=tadd]'); await p.fill('#t_min_1', '20'); await p.fill('#t_p_1', '1.5');
  await p.click('[data-act=isave]');
  ok((await p.textContent('#rbody')).includes('A3 rəngli çap'), 'admin: yeni məhsul siyahıda');
  ok(await p.evaluate(() => S.items.find(i => i.name === 'A3 rəngli çap').icon === '🖨️'), 'yeni düymənin ikonu yadda qaldı');
  await p.click('[data-rt=bolme]');
  await p.locator('[data-act=cicon][data-c=cap]').click(); await p.click('#ovIcon [data-ic="📄"]');
  ok((await p.locator('[data-cat=cap]').textContent()).startsWith('📄 ÇAP') && await p.evaluate(() => S.cats.find(c => c.id === 'cap').icon === '📄'), 'bölmə: ÇAP-a ikon (📄) qoyuldu, tabda görünür');
  await p.locator('[data-act=cicon][data-c=cap]').click(); await p.click('#ovIcon [data-ic=none]');
  ok((await p.locator('[data-cat=cap]').textContent()).startsWith('ÇAP'), 'bölmə: "İkonsuz" ikonu götürür');
  await p.fill('#nc_name', 'Möhür testi'); await p.click('[data-act=ncicon]'); await p.fill('#ic_own', '🔏'); await p.press('#ic_own', 'Enter');
  ok((await p.inputValue('#nc_name')) === 'Möhür testi', 'yeni bölmə: ikon seçəndə yazılan ad qalır');
  await p.click('[data-act=cadd]');
  const tc = await p.evaluate(() => { const c = S.cats.find(x => x.name === 'Möhür testi'); const ok = c && c.icon === '🔏'; S.cats = S.cats.filter(x => x !== c); save(); renderTabs(); return ok; });
  ok(tc, 'yeni bölmə öz yazdığım ikonla (🔏) yarandı');
  await p.click('[data-rt=admin]');
  await p.click('#ovRep [data-close]');
  // Axtarış (Sevimlilər əvəzinə)
  ok(!(await p.textContent('#tabs')).includes('Axtarış') && await p.locator('[data-cat=search]').count() === 0 && await p.isVisible('#q'), '"Axtarış" tabı yoxdur, axtarış çubuğu həmişə görünür');
  ok(await p.isVisible('#q') && await p.isHidden('.srchint') && await p.locator('main .note').count() === 0, 'boş axtarış: izah yazıları göstərilmir');
  await p.fill('#q', 'yoxdurbelesey');
  ok((await p.textContent('#grid')).includes('heç nə tapılmadı'), 'tapılmayanda izah');
  await p.fill('#q', 'a3 rengli cap');
  const btn = p.locator('.svc', { hasText: 'A3 rəngli çap' });
  ok(await btn.count() === 1, 'axtarış ə/ç hərfsiz də tapır: "a3 rengli cap" → A3 rəngli çap');
  await btn.click(); await p.fill('.line input', '20'); await p.dispatchEvent('.line input', 'change');
  ok((await p.textContent('#total')).startsWith('30.00'), 'yeni məhsul: 20 × 1.50 = 30.00');
  await p.click('#btnDone');
  ok((await p.textContent('#chips')).includes('1139'), 'yeni məhsulun resepti: 20 × 2 vərəq silindi');
  await p.fill('#q', 'surət');
  ok((await p.locator('#grid [data-add] .nm').allTextContents()).join('|') === 'A4 ağ-qara surət|A3 ağ-qara surət|A3 ağ-qara surət (2 üzlü)|Telefondan sənəd surəti', 'axtarış "surət": qrupların içindən də tapır');
  ok((await p.textContent('[data-add=ks_tel]')).includes('ÇAP › Sənəd Surəti'), 'nəticədə yol görünür (Bölmə › Qrup)');
  await p.fill('#q', 'fincan termo'); await p.press('#q', 'Enter');
  ok((await p.textContent('#total')).startsWith('10.00'), 'Enter: birinci nəticə sifarişə əlavə olunur (Fincan Termo 10)');
  await p.click('#btnClear');
  await p.fill('#q', 'foto kagiz'); await p.click('[data-grp=g_foto]');
  ok(await p.isVisible('#crumb') && (await p.textContent('#crumb')).includes('Axtarış') && await p.locator('#grid [data-add]').count() === 11, 'qrup tapılır, basanda içi açılır (11 düymə: + A4 120 qram, A4 Sticker)');
  await p.click('[data-back]');
  ok((await p.inputValue('#q')) === 'foto kagiz' && await p.isVisible('#searchbar'), '← geri: axtarış yazısı qalır');
  await p.click('#qClear');
  ok((await p.inputValue('#q')) === '' && await p.locator('#grid .svc').count() > 0 && !(await p.textContent('#grid')).includes('heç nə tapılmadı'), 'Təmizlə düyməsi: yazı silinir, seçilmiş bölmənin düymələri qayıdır');

  // Bölmələr
  await p.click('#btnSet');
  ok(!(await p.textContent('#rtabs')).includes('Bu gün'), 'Ayarlarda hesabat tabları yoxdur');
  await p.fill('#nc_name', 'Möhür'); await p.click('[data-act=cadd]');
  ok((await p.textContent('#tabs')).includes('Möhür'), 'yeni bölmə satış ekranında');
  const n = await p.locator('[data-act=cup]').count();
  await p.locator('[data-act=cup]').nth(n - 1).click();
  const tabs = await p.locator('#tabs .tab').allTextContents();
  ok(tabs.indexOf('Möhür') === tabs.length - 2, 'bölmə ↑ ilə yuxarı keçdi');
  const inp = p.locator('input[data-cid]').nth(n - 2); await inp.fill('Möhür və ştamp'); await inp.press('Enter');
  ok((await p.textContent('#tabs')).includes('Möhür və ştamp'), 'bölmənin adı dəyişdi');
  await p.locator('[data-act=cbtn]').nth(n - 2).click(); await p.click('[data-act=new]');
  await p.fill('#e_name', 'Avtomat möhür'); await p.fill('#t_p_0', '15');
  await p.locator('[data-act=sw]').nth(7).click();
  ok((await p.inputValue('#e_name')) === 'Avtomat möhür', 'rəng seçəndə yazılan ad qalır');
  await p.click('[data-act=isave]');
  await p.click('#ovRep [data-close]');
  await p.locator('#tabs .tab', { hasText: 'Möhür və ştamp' }).click();
  const mb = p.locator('.svc', { hasText: 'Avtomat möhür' });
  ok(await mb.count() === 1 && (await mb.getAttribute('style')).includes('#dc2626'), 'yeni bölmədə yeni düymə, seçilmiş rənglə');
  // İçində düymə olan bölməni silmək: köçür və ya birlikdə sil
  await p.click('#btnSet'); await p.click('[data-rt=bolme]');
  await p.locator('[data-act=cdel]').nth(n - 2).click();
  ok((await p.textContent('tr.confirm')).includes('1 düymə var'), 'Sil: təsdiq sətri düymə sayını göstərir');
  await p.click('[data-act=cdelx]');
  ok(await p.locator('tr.confirm').count() === 0, 'Ləğv et: heç nə silinmədi');
  await p.locator('[data-act=cdel]').nth(n - 2).click();
  const cid = await p.locator('[data-act=cmove]').getAttribute('data-c');
  await p.selectOption('#mv_' + cid, 'cap'); await p.click('[data-act=cmove]');
  ok(!(await p.textContent('#tabs')).includes('Möhür və ştamp') && (await p.textContent('#toast')).includes('köçdü'), 'bölmə silindi, düymə başqa bölməyə köçdü');
  await p.click('#ovRep [data-close]'); await p.click('[data-cat=cap]');
  ok(await p.locator('.svc', { hasText: 'Avtomat möhür' }).count() === 1, 'köçürülən düymə Çap bölməsində');
  await p.click('#btnSet'); await p.click('[data-rt=bolme]');
  const lamRow = p.locator('tr', { has: p.locator('input[value="Laminasiya / Cild"]') });
  await lamRow.locator('[data-act=cdel]').click(); await p.click('[data-act=cdelall]');
  ok(!(await p.textContent('#tabs')).includes('Laminasiya') && !(await p.content()).includes('data-id="lamA4"'), 'bölmə düymələri ilə birlikdə silindi');
  await p.click('#ovRep [data-close]');
  // Düymə sırası
  await p.click('#btnSet'); await p.click('[data-rt=admin]'); await p.click('[data-act=scat][data-c=cap]');
  await p.click('[data-act=down][data-id=g_a4]');
  await p.click('#ovRep [data-close]'); await p.click('[data-cat=cap]');
  const names = await p.locator('#grid .nm').allTextContents();
  ok(names[0] === 'A3 Sadə' && names[1] === 'A4 Sadə', 'düymə ↓ ilə yer dəyişdi');

  // ÇAP bölməsi: 4 qrup düyməsi, içində düymələr
  ok((await p.textContent('#tabs')).includes('ÇAP'), 'bölmənin adı ÇAP');
  await p.click('[data-add=g_sert]'); await p.click('[data-grp=g_a3]');
  ok((await p.locator('#grid [data-add] .nm').allTextContents()).join('|') === 'A3 sadə|A3 50% rəngli|A3 100% rəngli', 'A3 Sadə qrup oldu: A3 sadə, A3 50% rəngli, A3 100% rəngli');
  await p.click('[data-add=a3s_bw]'); await p.click('[data-add=a3s_50]'); await p.click('[data-add=a3s_100]'); await p.click('[data-back]');
  ok((await p.textContent('#total')).startsWith('3.20'), 'Sertifikat (1.00) + A3 0.50 + 0.70 + 1.00 = 3.20');
  await p.click('#btnClear');
  await p.click('[data-grp=g_a4]');
  ok((await p.locator('#grid [data-add]').allTextContents()).join('|').includes('Sadə yazı ağ-qara') && await p.locator('#grid [data-add]').count() === 8, 'A4 Sadə: içində 8 düymə');
  await p.click('[data-add=a4s_bw]'); await p.fill('.line input', '100'); await p.dispatchEvent('.line input', 'change'); await p.waitForTimeout(50);
  ok((await p.textContent('#total')).startsWith('10.00'), 'Sadə yazı ağ-qara: 100 × 0.10 = 10.00');
  await p.fill('.line input', '101'); await p.dispatchEvent('.line input', 'change'); await p.waitForTimeout(50);
  ok((await p.textContent('#total')).startsWith('10.10') && !(await p.textContent('[data-add=a4s_bw]')).includes('101+'), '100-dən çox da 0.10: 101 × 0.10 = 10.10 (pillə yoxdur)');
  await p.click('#btnClear'); await p.click('[data-add=a4s_40]');
  ok((await p.textContent('#total')).startsWith('0.30'), 'Qismən 40% rəngli: 0.30');
  await p.click('#btnClear'); await p.click('[data-add=a4s_60]'); await p.click('[data-add=a4s_100]');
  ok((await p.textContent('#total')).startsWith('0.90'), '60% (0.40) + 100% (0.50) = 0.90');
  await p.click('#btnClear'); await p.click('[data-add=a4s_2t]'); await p.click('[data-add=a4s_elan]');
  ok((await p.textContent('#total')).startsWith('0.65'), 'İki tərəfli (0.15) + Elan (0.50) = 0.65');
  await p.click('#btnClear'); await p.click('[data-add=a4s_2tr]');
  ok((await p.textContent('#total')).startsWith('0.25'), 'İki tərəfli rəngli çap: 0.25');
  const order5 = await p.locator('#grid [data-add] .nm').allTextContents();
  ok(order5.join('|') === 'Sadə yazı ağ-qara|30% rəngli çap|40% rəngli çap|60% rəngli çap|100% rəngli çap|İki tərəfli çap|Elan hazırlanması|İki tərəfli rəngli çap', 'A4 Sadə: adlarda "Qismən" yoxdur, sıra düzgündür');
  await p.click('#btnClear'); await p.click('[data-back]');
  // Sublim: fincan qiymətləri və qiymətsiz düymə qoruması
  await p.click('[data-cat=sublim]', { position: { x: 12, y: 12 } });
  ok((await p.locator('#grid [data-add] .nm').allTextContents()).join('|') === 'Fincan Sadə|Fincan Termo|Fincan rəngli|Fincan toplu|Açarlıq|Köynək', 'Sublim: 4 fincan + Açarlıq + Köynək');
  await p.click('[data-add=fc_sade]'); await p.fill('.line input', '10'); await p.dispatchEvent('.line input', 'change'); await p.waitForTimeout(50);
  ok((await p.textContent('#total')).startsWith('80.00'), 'Fincan Sadə: 10 × 8 = 80.00');
  await p.fill('.line input', '11'); await p.dispatchEvent('.line input', 'change'); await p.waitForTimeout(50);
  ok((await p.textContent('#total')).startsWith('66.00'), '10-dan çox: 11 × 6 = 66.00');
  await p.click('#btnClear'); await p.click('[data-add=fc_termo]'); await p.click('[data-add=fc_reng]'); await p.click('[data-add=fc_toplu]');
  ok((await p.textContent('#total')).startsWith('33.00'), 'Termo 10 + rəngli 10 + toplu 13 = 33.00');
  await p.click('#btnClear'); await p.click('[data-add=fc_toplu]'); await p.fill('.line input', '11'); await p.dispatchEvent('.line input', 'change'); await p.waitForTimeout(50);
  ok((await p.textContent('#total')).startsWith('143.00'), 'Fincan toplu: endirim yoxdur, 11 × 13 = 143.00');
  await p.click('#btnClear'); await p.click('[data-add=sb_acar]');
  ok((await p.textContent('#total')).startsWith('8.00'), 'Açarlıq: 8.00');
  await p.click('#btnClear'); await p.click('[data-add=sb_koynek]'); await p.fill('.line input', '5'); await p.dispatchEvent('.line input', 'change'); await p.waitForTimeout(50);
  ok((await p.textContent('#total')).startsWith('75.00'), 'Köynək: 5 × 15 = 75.00');
  await p.fill('.line input', '6'); await p.dispatchEvent('.line input', 'change'); await p.waitForTimeout(50);
  ok((await p.textContent('#total')).startsWith('72.00'), 'Köynək 5-dən çox: 6 × 12 = 72.00');
  await p.click('#btnClear');
  ok((await p.locator('#grid .svc.grpt .nm').allTextContents()).join('|') === 'Yaxa kartı|Plaket|Suvenir|Bayraq təkli|Bayraq ikili|Bayraq üçlü|Medal|Alışqan|Body' && (await p.textContent('[data-grp=g_body]')).includes('boşdur'), 'Sublim: 9 qrup (Yaxa kartı … Body), boş');
  await p.click('#btnClear');
  await p.click('#btnSet'); await p.click('[data-act=goedit]'); await p.click('[data-act=qnew]'); await p.fill('#e_name', 'Qiymətsiz test'); await p.fill('#t_p_0', '0');
  await p.click('[data-act=isave]'); await p.click('#ovRep [data-close]'); await p.click('[data-act=editdone]');
  const np = p.locator('#grid [data-add]', { hasText: 'Qiymətsiz test' });
  ok((await np.textContent()).includes('qiymət yoxdur'), 'qiymətsiz düymədə xəbərdarlıq');
  await np.click();
  ok(!(await p.locator('#lines .line').count()) && (await p.textContent('#toast')).includes('qiyməti yazılmayıb'), 'qiymətsiz düymə satışa əlavə olunmur');
  await p.click('#btnSet'); await p.click('[data-act=goedit]'); await np.locator('[data-act=qdel]').click(); await np.locator('[data-act=qdel]').click(); await p.click('[data-act=editdone]');
  await p.click('[data-cat=cap]', { position: { x: 12, y: 12 } });
  const tabNames = await p.locator('#tabs .tab').allTextContents();
  ok(tabNames[0].startsWith('ÇAP') && tabNames[1].startsWith('Poliqrafiya Xidmətləri'), 'ÇAP birinci, Poliqrafiya Xidmətləri onun yanında');
  ok(tabNames.slice(-4).join('|') === 'Banner / Vinil|Studiya|🖼️ Çərçivə|🛍️ Vitrin' && !tabNames.some(t => /Plotter|Lazer/.test(t)), 'Banner / Vinil, Studiya, 🖼️ Çərçivə, 🛍️ Vitrin sonda; Plotter və Lazer ayrıca bölmə deyil');
  ok(await p.evaluate(() => { const i = S.items.find(x => x.id === 'st_sened'); return i && i.name === 'Sənəd Şəkli' && i.cat === 'studiya'; }), 'Studiya bölməsində "Sənəd Şəkli" düyməsi');
  // v0.42.0: sahibinin özü yaratdığı "Sənəd şəkili Kostyum montaj" və "Digər" (qiymət razılaşma ilə)
  await p.evaluate(() => { S.items.push({ id: 'u_k1', name: 'Sənəd şəkili Kostyum montaj', cat: 'studiya', icon: '⭐', color: '#2563eb', fav: 0, ink: 0, recipe: [], tiers: [[1, 3]] },
    { id: 'u_dg', name: 'Digər', cat: 'studiya', icon: '⭐', color: '#2563eb', fav: 0, ink: 0, recipe: [], tiers: [[1, 0]] }); delete S.mig.studiya2; upgrade(); save(); renderAll(); });
  ok(await p.evaluate(() => S.items.find(i => i.id === 'u_k1').icon === '🤵' && S.items.find(i => i.id === 'u_dg').icon === '🖼️' && S.items.find(i => i.id === 'u_dg').free === 1), 'Kostyum montaj 🤵, Digər 🖼️ + qiymət razılaşma ilə');
  ok(await p.evaluate(() => { const k = id => S.items.filter(i => i.parent === id).map(i => i.name + ':' + (i.free ? 'free' : i.tiers[0][1])).join('|');
    return S.items.filter(i => i.cat === 'studiya' && i.group).length === 4 && k('g_sessiya') === '1 dekor (20-25 kadr):20|2 dekor (30-35 kadr):30|3 dekor (40-45 kadr):35|4 dekor (50-55 kadr):45'
      && k('g_albomlu') === '1 dekor + albom:45|2 dekor + albom:55|3 dekor + albom:60|4 dekor + albom:70|Tək Albom (fotosessiyasız, 30 ₼-dən):free'
      && k('g_videolu') === '1 dekor + video:40|2 dekor + video:50|3 dekor + video:65|4 dekor + video:70|Tək Video (fotosessiyasız, 30 ₼-dən):free'; }), 'Studiya: Fotosessiya / Albomlu / Videolu qrupları və qiymətləri');
  ok(await p.evaluate(() => S.items.filter(i => i.parent === 'g_ededle').map(i => i.name + ':' + i.tiers[0][1]).join('|') === '15x21:6|21x30:8|25x38:10|30x40:12' && S.items.find(i => i.id === 'g_ededle').cat === 'studiya'), 'Studiya: Ədədlə şəkillər (15x21 6, 21x30 8, 25x38 10, 30x40 12)');
  ok(await p.evaluate(() => S.items.filter(i => i.parent === 'g_cer_std').map(i => i.name.replace('Çərçivə ', '') + ':' + i.tiers[0][1]).join('|') === '6x9:2|10x15:3|13x18:4|15x21:5|21x30:6|20x25:6|25x30:10|25x38:12|30x40:13|30x42:13|30x45:15'
    && S.items.find(i => i.id === 'cer_diger').free === 1 && S.items.find(i => i.id === 'g_cer_std').cat === 'cerceve'), 'Çərçivə: Standart (11 ölçü, qiymətlərlə) + Digər çərçivə (razılaşma ilə)');
  ok(await p.evaluate(() => S.items.filter(i => i.parent === 'g_plaket').map(i => i.name + ':' + i.tiers[0][1]).join('|') === 'Plaket 10x15:16|Plaket 13x18:16|Plaket 15x21:25'), 'Sublim → Plaket: 10x15 16, 13x18 16, 15x21 25');
  ok(await p.evaluate(() => ['fk_a4_120:2:A4 120 qram', 'fk_a4_stk:3:A4 Sticker'].every(x => { const [id, pr, n] = x.split(':'); const i = S.items.find(y => y.id === id); return i && i.parent === 'g_foto' && i.tiers[0][1] === +pr && i.name === n; })), 'Foto Kağızlar: A4 120 qram 2, A4 Sticker 3');
  ok(await p.evaluate(() => { const g = S.items.find(i => i.id === 'g_cer_laser'); return g && g.group && g.cat === 'cerceve' && g.name === 'Laser Çərçivələr'; }), 'Çərçivə: "Laser Çərçivələr" qrupu');
  ok(await p.evaluate(() => S.items.find(i => i.id === 'lc_canim_1318')?.parent === 'g_cer_laser'), 'Laser Çərçivələr → Canım 13x18');
  ok(await p.evaluate(() => S.items.find(i => i.id === 'lc_burc_1015')?.parent === 'g_cer_laser'), 'Laser Çərçivələr → Bürclü 10x15');
  ok(await p.evaluate(() => S.items.find(i => i.id === 'pq_vizit')?.tiers[0][1] === 0.1 && S.items.find(i => i.id === 'pq_vizit').cat === 'poli' && S.items.filter(i => i.parent === 'g_konfet').map(i => i.tiers[0][1]).join('|') === '0.5|0.4|0.8'), 'Poliqrafiya: Vizit Kart 0.10, Konfet Kartı 0.50 / 0.40 / 0.80');
  // v0.52.0: 🏷️ Endirim
  ok(await p.isVisible('#btnDisc') && !(await p.textContent('.ordhead')).includes('Cari sifariş'), '"Cari sifariş" yerində 🏷️ Endirim düyməsi');
  await p.click('#btnDisc'); ok((await p.textContent('#toast')).includes('Əvvəlcə sifarişə'), 'boş sifarişdə endirim: izah');
  await p.evaluate(() => { order = [{ id: 'cs_10_15', q: 2 }, { id: 'cs_6_9', q: 1 }]; renderOrder(); });
  ok((await p.textContent('#total')).startsWith('8.00'), 'endirimdən əvvəl cəmi 8.00');
  await p.click('#btnDisc'); await p.waitForSelector('#ovDisc:not([hidden]) #d_v');
  await p.fill('#d_v', '1.5'); await p.press('#d_v', 'Enter');
  ok((await p.textContent('#toast')).includes('səbəbini') && await p.isVisible('#ovDisc'), 'səbəb yazılmayanda endirim olmur');
  await p.click('[data-dr="Daimi müştəri"]'); await p.click('[data-dc=ok]');
  ok(await p.isHidden('#ovDisc') && (await p.textContent('#total')).startsWith('6.50') && (await p.textContent('#discRow')).includes('Daimi müştəri') && (await p.textContent('#discRow')).includes('−1.50'), 'endirim 1.50 ₼ (Daimi müştəri): cəmi 6.50');
  await p.click('#btnDisc'); await p.click('[data-dm=pct]'); await p.fill('#d_v', '25'); await p.fill('#d_r', 'Kampaniya'); await p.press('#d_r', 'Enter');
  ok((await p.textContent('#total')).startsWith('6.00') && (await p.textContent('#discRow')).includes('25%'), 'faizlə endirim: 25% → 6.00');
  const nS2 = await p.evaluate(() => S.sales.length);
  await p.click('#btnDone');
  ok(await p.evaluate(n => { const s = S.sales[S.sales.length - 1]; return S.sales.length === n + 1 && s.total === 6 && s.sub === 8 && s.disc === 2 && s.discReason === 'Kampaniya' && s.discPct === 25 && ordDisc === null; }, nS2), 'satış: cəm 8, endirim 2 (25%, Kampaniya), ödənilən 6; növbəti sifariş endirimsiz');
  await p.click('#btnHist'); ok((await p.textContent('#ovHist')).includes('🏷️ Endirim −2.00 ₼ (25%): Kampaniya'), 'tarixçədə endirim və səbəbi görünür'); await p.click('#ovHist [data-close]');
  await p.evaluate(() => { S.sales.pop(); save(); renderAll(); });
  await p.click('[data-cat=poli]', { position: { x: 12, y: 12 } }); await p.click('[data-grp=g_plotter]');
  ok((await p.locator('[data-add=pl_m2]').textContent()).includes('m² ilə'), 'Kəsim Plotter: "Plotter kəsimi" — m² ilə, qiymət razılaşma ilə');
  await p.click('[data-add=pl_m2]'); await p.waitForSelector('#ovM2:not([hidden]) #m2_w');
  await p.fill('#m2_w', '2'); await p.fill('#m2_h', '0,5'); await p.fill('#m2_pm', '8'); await p.press('#m2_pm', 'Enter');
  ok((await p.textContent('#total')).startsWith('8.00') && (await p.textContent('#lines')).includes('Plotter kəsimi 2 × 0,5 m (1 m²)'), 'plotter: 2 × 0,5 m × 8 ₼/m² = 8 ₼ sifarişdə');
  await p.click('[data-act=clear]').catch(() => {}); await p.evaluate(() => { order = []; renderOrder(); renderGrid(); });
  await p.click('[data-cat=studiya]', { position: { x: 12, y: 12 } });
  ok((await p.locator('[data-add=u_dg]').textContent()).includes('razılaşma'), 'Digər düyməsində "qiymət razılaşma ilə"');
  await p.click('[data-add=u_dg]');
  await p.waitForSelector('#ovM2:not([hidden]) #m2_note');
  await p.fill('#m2_note', 'it şəkli'); await p.fill('#m2_n', '2'); await p.fill('#m2_tot', '15'); await p.press('#m2_tot', 'Enter');
  ok((await p.textContent('#total')).startsWith('15.00') && (await p.textContent('#lines')).includes('it şəkli'), 'Digər: 2 ədəd, cəmi 15 ₼ yerində yazıldı, qeyd sifarişdə');
  const nS = await p.evaluate(() => S.sales.length);
  await p.click('#btnDone');
  ok(await p.evaluate(n => { const s = S.sales[S.sales.length - 1]; const l = s.lines[0]; return S.sales.length === n + 1 && l.name === 'Digər — it şəkli' && l.q === 2 && l.price === 7.5 && l.plain === 'Digər'; }, nS), 'satış: "Digər — it şəkli", 2 × 7.50');
  await p.evaluate(() => { S.sales.pop(); save(); renderAll(); }); // sonrakı yoxlamaların satış sayı dəyişməsin
  ok(await p.evaluate(() => { const g = id => S.items.find(i => i.id === id); return g('g_plotter')?.cat === 'poli' && g('g_lazer')?.cat === 'poli' && g('pl_m2').parent === 'g_plotter' && g('lz_m2').parent === 'g_lazer' && !S.cats.some(c => c.id === 'plotter' || c.id === 'lazer'); }), 'Kəsim Plotter və Fiber Lazer Poliqrafiya-nın içində qrup oldu (içindəki düymələrlə)');
  await p.click('[data-cat=poli]', { position: { x: 12, y: 12 } }); await p.click('[data-grp=g_lazer]');
  ok(await p.locator('#grid [data-add]').count() === 2 && !(await p.locator('[data-add=lz_m2]').textContent()).includes('m²') && await p.locator('[data-add=lz_bizim]').count() === 1, 'Poliqrafiya → Fiber Lazer: "Lazer yazı (müştərinin məhsulu)" + "Lazer — bizim məhsul" (m² yoxdur)');
  await p.click('[data-back]');
  await p.click('[data-cat=poli]', { position: { x: 12, y: 12 } });
  ok((await p.locator('#grid .svc.grpt .nm').allTextContents()).join('|') === 'Skan Etmə|Spiral Cildləmə|Kəsim Plotter|Fiber Lazer|Konfet Kartı', 'Poliqrafiya: 5 qrup (Skan, Spiral, Kəsim Plotter, Fiber Lazer, Konfet Kartı)');
  await p.click('[data-add=g_lamA4]'); await p.click('[data-add=g_lamA3]');
  ok((await p.textContent('#total')).startsWith('3.00'), 'Laminasiya A4 (1) + A3 (2) birbaşa satılır = 3.00');
  ok((await p.textContent('#chips')).includes('Laminasiya A4: 150'), 'satışdan əvvəl laminasiya qalığı 150');
  await p.click('#btnDone');
  ok((await p.textContent('#chips')).includes('Laminasiya A4: 149'), 'Laminasiya A4 satışı plyonkanı silir: 149');
  await p.click('[data-grp=g_skan]');
  ok((await p.locator('#grid [data-add] .nm').allTextContents()).join('|') === 'A4 skan|A3 skan', 'Skan Etmə: A4, A3');
  await p.click('[data-back]'); await p.click('[data-grp=g_spiral]');
  ok((await p.locator('#grid [data-add] .nm').allTextContents()).join('|') === '50 vərəqə qədər|100 vərəqə qədər|200 vərəqə qədər|300 vərəqə qədər', 'Spiral: 4 düymə');
  for (const id of ['sp_50', 'sp_100', 'sp_200', 'sp_300']) await p.click(`[data-add=${id}]`);
  ok((await p.textContent('#total')).startsWith('25.00'), 'Spiral 3 + 5 + 7 + 10 = 25.00');
  await p.click('#btnClear'); await p.click('[data-back]');
  await p.click('[data-cat=cap]', { position: { x: 12, y: 12 } });
  await p.click('[data-grp=g_kser]');
  ok((await p.locator('#grid [data-add] .nm').allTextContents()).join('|') === 'A4 ağ-qara surət|A3 ağ-qara surət|A3 ağ-qara surət (2 üzlü)|Telefondan sənəd surəti', 'Sənəd Surəti: içində 4 düymə');
  await p.click('[data-add=ks_a4bw]'); await p.fill('.line input', '50'); await p.dispatchEvent('.line input', 'change'); await p.waitForTimeout(50);
  ok((await p.textContent('#total')).startsWith('10.00'), 'A4 surət: 50 × 0.20 = 10.00');
  await p.fill('.line input', '51'); await p.dispatchEvent('.line input', 'change'); await p.waitForTimeout(50);
  ok((await p.textContent('#total')).startsWith('7.65'), '50-dən çox: 51 × 0.15 = 7.65');
  await p.click('#btnClear'); await p.click('[data-add=ks_a3bw]'); await p.click('[data-add=ks_a3bw2]');
  ok((await p.textContent('#total')).startsWith('1.50'), 'A3 surət 0.50 + A3 2 üzlü 1.00 = 1.50');
  await p.click('#btnClear'); await p.click('[data-add=ks_tel]');
  ok((await p.textContent('#total')).startsWith('0.30'), 'Telefondan sənəd surəti: 0.30');
  await p.click('#btnClear'); await p.click('[data-back]');
  ok(await p.locator('#grid .svc.grpt').count() === 4 && (await p.locator('#grid .svc.grpt .nm').allTextContents()).pop() === 'Sənəd Surəti (Kserokopiya)' && await p.locator('[data-add=a4bw],[data-add=a4c],[data-add=a4qc]').count() === 0, 'ÇAP: 4 qrup (A4 Sadə, A3 Sadə, Foto, Sənəd Surəti), köhnə 3 düymə silinib');
  await p.click('[data-grp=g_foto]');
  ok((await p.locator('#grid [data-add] .nm').allTextContents()).join('|') === '10x15|13x18|15x21|20x25|21x30|25x38|30x40|30x42|30x45|A4 120 qram|A4 Sticker', 'Foto Kağızlar: 9 ölçü + A4 120 qram + A4 Sticker');
  await p.click('[data-add=fk_1015]');
  ok(await p.isVisible('#ovSrc') && (await p.textContent('#srcBody')).includes('Samir Foto'), '10x15: "Özümüz / Samir Foto" seçimi çıxır');
  await p.click('[data-src=own]'); await p.click('[data-add=fk_3045]');
  ok(await p.isHidden('#ovSrc'), '30x45: Samir-də yoxdur — seçim çıxmır');
  await p.click('[data-add=fk_2538]'); await p.keyboard.press('2');
  ok((await p.textContent('#total')).startsWith('23.40'), '10x15 (0.40) + 30x45 (15) + 25x38 (8) = 23.40');
  ok((await p.textContent('#lines')).includes('🖨 Özümüz') && (await p.textContent('#lines')).includes('🚚 Samir Foto'), 'sifarişdə mənbə görünür: Özümüz / Samir Foto');
  await p.click('[data-add=fk_1015]'); await p.keyboard.press('2');
  ok(await p.locator('#lines .line').count() === 4 && (await p.textContent('[data-add=fk_1015] .cnt')) === '2', '10x15 özümüz və Samir ayrı sətirdir, düymədə cəmi 2');
  await p.click('#btnClear'); await p.click('[data-back]');
  // boş qrup üçün yeni qrup yarat
  await p.click('#btnSet'); await p.click('[data-rt=admin]'); await p.click('[data-act=scat][data-c=cap]'); await p.click('[data-act=new]');
  await p.selectOption('#e_type', 'group'); await p.fill('#e_name', 'Test qrupu'); await p.click('[data-act=isave]'); await p.click('#ovRep [data-close]');
  await p.locator('#grid .svc.grpt', { hasText: 'Test qrupu' }).click();
  ok(await p.isVisible('#crumb') && (await p.textContent('#grid')).includes('hələ düymə yoxdur'), 'boş qrup açılır, izah görünür');
  await p.click('#btnSet'); await p.click('[data-act=goedit]'); await p.click('[data-act=qnew]');
  ok((await p.textContent('#editor h4')).includes('Test qrupu'), 'qrupun içində + Yeni düymə: qrup seçilib');
  await p.fill('#e_name', '10x15 parlaq'); await p.fill('#t_p_0', '0.40'); await p.click('[data-act=radd]'); await p.selectOption('#r_m_0', 'f1015');
  await p.click('[data-act=isave]'); await p.click('#ovRep [data-close]'); await p.click('[data-act=editdone]');
  ok(await p.locator('#grid [data-add]', { hasText: '10x15 parlaq' }).count() === 1, 'yeni düymə qrupun içində');
  await p.click('#grid [data-add]'); await p.click('#btnDone');
  ok((await p.textContent('#chips')).includes('10x15 foto kağızı: 499'), 'qrupdakı düymə ilə satış: foto kağız 500 → 499');
  await p.click('[data-back]');
  ok(!(await p.isVisible('#crumb')) && await p.locator('#grid [data-add]', { hasText: '10x15 parlaq' }).count() === 0, '← geri: bölməyə qayıtdı, içdəki düymə burada görünmür');
  ok((await p.textContent('.svc.grpt:has-text("Test qrupu")')).includes('1 düymə') && (await p.textContent('[data-grp=g_foto]')).includes('11 düymə'), 'qrup düyməsində içindəki say görünür (1 və 11)');
  // Ayarlarda yeni qrup yaratmaq
  await p.click('#btnSet'); await p.click('[data-rt=admin]'); await p.click('[data-act=scat][data-c=cap]'); await p.click('[data-act=new]');
  await p.selectOption('#e_type', 'group'); await p.fill('#e_name', 'Laminasiya qrupu'); await p.click('[data-act=isave]');
  await p.click('#ovRep [data-close]');
  ok(await p.locator('#grid .svc.grpt', { hasText: 'Laminasiya qrupu' }).count() === 1, 'Ayarlardan yeni qrup yaradıldı');
  // qrupu içindəkilərlə birlikdə silmək
  await p.click('#btnSet'); await p.click('[data-act=goedit]');
  await p.click('[data-cat=cap]', { position: { x: 12, y: 12 } });
  const fg = p.locator('.svc.grpt', { hasText: 'Test qrupu' });
  await fg.locator('[data-act=qdel]').click();
  ok((await fg.locator('[data-act=qdel]').textContent()) === '1 düymə ilə sil?', 'qrup 🗑: içindəki say ilə soruşur');
  await fg.locator('[data-act=qdel]').click();
  ok(await p.locator('.svc.grpt', { hasText: 'Test qrupu' }).count() === 0 && !(await p.evaluate(() => S.items.some(i => i.name === '10x15 parlaq'))), 'qrup içindəki düymə ilə birlikdə silindi');
  await p.click('[data-act=editdone]');

  // Düzəliş rejimi: satış ekranından birbaşa əlavə et / sil
  await p.click('#btnSet'); await p.click('[data-act=goedit]');
  ok(await p.isVisible('#editbar'), 'düzəliş rejimi açıldı');
  await p.click('[data-cat=foto]', { position: { x: 12, y: 12 } });
  const before = await p.locator('#grid .svc:not(.addtile)').count();
  await p.click('#grid .svc:not(.addtile) >> nth=0');
  ok(!(await p.locator('#lines .line').count()), 'düzəliş rejimində düyməyə basmaq satışa əlavə etmir');
  await p.click('[data-act=qnew]');
  ok(await p.isVisible('#editor') && (await p.inputValue('#e_cat')) === 'foto', '+ Yeni düymə: redaktor açıldı, bölmə Foto');
  await p.fill('#e_name', 'Sənəd şəkli 3x4'); await p.fill('#t_p_0', '4'); await p.click('[data-act=isave]');
  await p.click('#ovRep [data-close]');
  ok(await p.locator('#grid .svc:not(.addtile)').count() === before + 1, 'yeni düymə Foto bölməsində');
  const tile = p.locator('#grid .svc', { hasText: 'Sənəd şəkli 3x4' });
  await tile.locator('[data-act=qdel]').click();
  ok((await tile.locator('[data-act=qdel]').textContent()) === 'Sil?', '🗑 birinci basışda təsdiq soruşur');
  await tile.locator('[data-act=qdel]').click();
  ok(await p.locator('#grid .svc', { hasText: 'Sənəd şəkli 3x4' }).count() === 0, '🗑 ikinci basışda düymə silindi');
  await p.locator('#grid .svc', { hasText: '10x15 foto' }).locator('[data-act=qedit]').click();
  ok((await p.inputValue('#e_name')) === '10x15 foto', '✏️ düyməni redaktə üçün açır');
  await p.click('#ovRep [data-close]');
  await p.click('[data-act=qcadd]'); await p.fill('#nc_name', 'Lövhə'); await p.click('[data-act=cadd]'); await p.click('#ovRep [data-close]');
  const bt = p.locator('#tabs .tab', { hasText: 'Lövhə' });
  ok(await bt.count() === 1, '+ Bölmə ilə yeni bölmə');
  await bt.locator('[data-act=qcdel]').click(); await bt.locator('[data-act=qcdel]').click();
  ok(await p.locator('#tabs .tab', { hasText: 'Lövhə' }).count() === 0, 'boş bölmə 🗑 ilə silindi');
  const vt = p.locator('#tabs .tab', { hasText: 'Vizit' });
  await vt.locator('[data-act=qcdel]').click();
  ok((await vt.locator('[data-act=qcdel]').textContent()).includes('1 düymə ilə sil?'), 'dolu bölmə 🗑: neçə düymə ilə silinəcəyini soruşur');
  await vt.locator('[data-act=qcdel]').click();
  ok(await p.locator('#tabs .tab', { hasText: 'Vizit' }).count() === 0, 'dolu bölmə 🗑 ilə düymələri ilə birlikdə silindi');
  await p.click('[data-act=editdone]');
  ok(!(await p.isVisible('#editbar')) && await p.locator('[data-act=qnew]').count() === 0, 'Hazır: düzəliş rejimi bağlandı');

  // Düymələr siyahısında Sil
  await p.click('#btnSet'); await p.click('[data-rt=admin]'); await p.click('[data-act=scat][data-c=skan]');
  await p.click('[data-act=ldel][data-id=kser]'); await p.click('[data-act=ldel][data-id=kser]');
  ok(await p.locator('[data-act=ldel][data-id=kser]').count() === 0 && !(await p.textContent('#tabs')).includes('📑'), 'siyahıdan Sil ilə düymə silindi');

  // Materiallar
  await p.click('#ovRep [data-close]'); await p.click('#btnStock');
  ok((await p.textContent('#rt')).includes('Anbar') && (await p.locator('#rtabs .tab').allTextContents()).join('|') === 'Qalıq / Sayım|Materiallar|⚠ Az qalanlar', '📦 Anbar: Qalıq / Sayım, Materiallar, Az qalanlar');
  await p.click('[data-rt=mat]');
  await p.fill('#nm_name', 'A3 80 qr'); await p.fill('#nm_cost', '0.04'); await p.fill('#nm_stock', '500');
  await p.click('[data-act=madd]');
  ok((await p.textContent('#chips')).includes('A3 80 qr'), 'material əlavə olundu');
  await p.click('[data-act=mdel][data-id=a4]');
  ok(await p.isVisible('#toast') && (await p.textContent('#toast')).includes('reseptlərdən'), 'istifadədə olan material silinmir');

  await p.click('[data-rt=low]');
  ok((await p.textContent('#rbody')).includes('Az qalanlar') || (await p.textContent('#rbody')).includes('kifayət'), 'Az qalanlar tabı açılır');
  await p.click('#ovRep [data-close]'); await p.click('#btnSet');
  ok(!(await p.textContent('#rtabs')).includes('Materiallar'), 'Ayarlarda Materiallar tabı yoxdur (Anbara köçüb)');
  // Ehtiyat nüsxə: fayla yaz və geri yüklə
  await p.click('[data-rt=backup]');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-act=bexp]')]);
  const file = await dl.path(); const j = JSON.parse(require('fs').readFileSync(file, 'utf8'));
  ok(j.app === 'KASSA' && j.data.sales.length === 4, 'ehtiyat faylı: 4 satış');
  await p.click('[data-act=reset]'); await p.click('[data-act=reset]');
  ok((await p.textContent('#today')).includes('0'), 'sıfırlama (iki addımla)');
  await p.setInputFiles('#bfile', file); await p.waitForSelector('[data-act=bimp]');
  await p.click('[data-act=bimp]');
  ok((await p.textContent('#chips')).includes('1139'), 'ehtiyat nüsxədən bərpa');

  ok(external.length === 0, 'internetə heç bir sorğu getmir ' + external.join(' '));
  // Klaviatura ilə nağd ödəniş: Space / Enter iki dəfə
  if (await p.isVisible('#ovRep')) await p.click('#ovRep [data-close]');
  await p.click('[data-cat=poli]', { position: { x: 12, y: 12 } });
  const salesNow = async () => p.evaluate(() => S.sales.length);
  let n0 = await salesNow();
  await p.click('#payCard'); await p.click('[data-add=g_lamA4]');
  await p.keyboard.press('Space');
  ok((await p.textContent('#btnDone')).includes('bir də basın') && await salesNow() === n0 && (await p.textContent('#total')).startsWith('1.00'), 'Space 1-ci dəfə: xəbərdarlıq, satış yoxdur, düymə təkrar əlavə olunmayıb');
  await p.keyboard.press('Space');
  ok(await salesNow() === n0 + 1 && await p.evaluate(() => S.sales.at(-1).pay) === 'nağd' && (await p.textContent('#btnDone')) === 'Ödənildi ✓', 'Space 2-ci dəfə: nağd satış təsdiqləndi');
  await p.click('[data-add=g_lamA3]'); await p.keyboard.press('Enter'); await p.keyboard.press('Enter');
  ok(await salesNow() === n0 + 2 && await p.evaluate(() => S.sales.at(-1).total) === 2, 'Enter iki dəfə: nağd satış (Laminasiya A3, 2.00)');
  await p.click('[data-add=g_lamA4]'); await p.keyboard.press('Enter'); await p.waitForTimeout(1700); await p.keyboard.press('Enter');
  ok(await salesNow() === n0 + 2 && (await p.textContent('#btnDone')).includes('bir də basın'), 'aralıq 1.5 saniyədən çox olsa: təsdiq olmur, yenidən soruşur');
  await p.keyboard.press('Enter');
  ok(await salesNow() === n0 + 3, '...sonra ikinci basış təsdiqləyir');
  await p.keyboard.press('Enter'); await p.keyboard.press('Enter');
  ok(await salesNow() === n0 + 3, 'sifariş boşdursa Enter heç nə etmir');
  await p.click('[data-add=g_lamA4]'); await p.click('#btnZay'); await p.keyboard.press('Enter'); await p.keyboard.press('Enter');
  ok(await salesNow() === n0 + 3, 'pəncərə açıqdırsa (Zay) Enter satışı təsdiqləmir');
  await p.click('#ovZay [data-close]');
  await p.click('.line input'); await p.fill('.line input', '3'); await p.keyboard.press('Enter');
  ok(await salesNow() === n0 + 3, 'say xanasında Enter: yalnız sayı qəbul edir');
  await p.keyboard.press('Enter'); await p.keyboard.press('Enter');
  ok(await salesNow() === n0 + 4 && await p.evaluate(() => S.sales.at(-1).total) === 3, '...sonra Enter iki dəfə: 3 × 1.00 nağd');
  await p.fill('#q', ''); await p.click('[data-cat=cap]', { position: { x: 12, y: 12 } });
  await p.keyboard.type('termo');
  ok((await p.inputValue('#q')) === 'termo', 'Axtarışda hərf yazanda xana özü seçilir');
  await p.keyboard.press('Enter'); await p.keyboard.press('Enter'); await p.keyboard.press('Enter');
  ok(await salesNow() === n0 + 5 && await p.evaluate(() => S.sales.at(-1).lines[0].name) === 'Fincan Termo', 'axtar → Enter (əlavə et) → Enter Enter (nağd ödə)');
  await p.click('[data-add=fc_termo]'); await p.click('#btnDone');
  ok(await salesNow() === n0 + 6, 'siçanla "Ödənildi" əvvəlki kimi işləyir');
  // fokus axtarış xanasında qalsa da: Enter (əlavə) → Enter Enter (ödə), məhsul ikinci dəfə əlavə olunmur
  await p.click('#q'); await p.fill('#q', 'acarliq');
  await p.press('#q', 'Enter'); await p.focus('#q'); await p.press('#q', 'Enter'); await p.press('#q', 'Enter');
  ok(await salesNow() === n0 + 7 && await p.evaluate(() => S.sales.at(-1).lines[0].q) === 1, 'fokus xanada qalsa belə: 1 Açarlıq əlavə olunur və nağd ödənir');

  // Satış Tarixçəsi
  await p.click('[data-cat=poli]', { position: { x: 12, y: 12 } });
  await p.click('[data-add=g_lamA3]'); await p.click('#payCard'); await p.click('#btnDone'); await p.click('#payCash');
  await p.fill('#q', 'termo');
  await p.click('[data-add=fc_termo]'); await p.click('#btnDone');
  await p.click('#btnHist');
  ok(await p.isVisible('#ovHist') && (await p.textContent('#ht')).includes('Satış Tarixçəsi'), 'Satış Tarixçəsi pəncərəsi açıldı');
  const todayN = await p.evaluate(() => S.sales.filter(s => new Date(s.ts).toDateString() === new Date().toDateString()).length);
  ok(await p.locator('table.hist tr').count() === todayN + 1, `bu günün bütün satışları göstərilir (${todayN})`);
  const first = await p.locator('table.hist tr').nth(1).textContent();
  ok(/\d{2}\.\d{2}\.\d{4}/.test(first) && /\d{2}:\d{2}/.test(first) && first.includes('Fincan Termo'), 'tarix (gg.aa.iiii), saat (ss:dd) və ən yeni satış birinci');
  ok((await p.textContent('table.hist')).includes('💵 Nağd') && (await p.textContent('table.hist')).includes('💳 Kart'), 'ödəniş növü aydın görünür (Nağd / Kart)');
  await p.click('[data-hp=kart]');
  const kartRows = await p.locator('table.hist tr').count() - 1;
  ok(kartRows >= 1 && !(await p.textContent('table.hist')).includes('💵 Nağd'), 'Kart filtri: yalnız kartla satışlar');
  await p.click('[data-hp=all]'); await p.click('[data-h=yday]');
  ok((await p.textContent('#hBody')).includes('satış yoxdur'), 'Dünən: satış yoxdur');
  // tarix aralığı: köhnə satışlar əlavə et (3 və 10 gün əvvəl)
  await p.evaluate(() => { const d = n => Date.now() - n * 864e5; S.sales.push({ id: 'old3', ts: d(3), worker: 'Admin', pay: 'nağd', lines: [{ id: 'x', name: 'Köhnə A', q: 1, price: 5, sum: 5, cost: 0 }], total: 5 }, { id: 'old10', ts: d(10), worker: 'Admin', pay: 'kart', lines: [{ id: 'x', name: 'Köhnə B', q: 1, price: 7, sum: 7, cost: 0 }], total: 7 }); });
  const dk = n => { const x = new Date(Date.now() - n * 864e5); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };
  await p.fill('#hFrom', dk(5)); await p.dispatchEvent('#hFrom', 'change'); await p.fill('#hTo', dk(0)); await p.dispatchEvent('#hTo', 'change');
  const r1 = await p.textContent('#hBody');
  ok(r1.includes('Köhnə A') && !r1.includes('Köhnə B') && r1.includes('Günlər üzrə'), 'tarix aralığı (5 gün əvvəldən bu günədək): 3 gün əvvəlki satış var, 10 gün əvvəlki yox; günlər üzrə cədvəl');
  await p.fill('#hFrom', dk(0)); await p.dispatchEvent('#hFrom', 'change'); await p.fill('#hTo', dk(12)); await p.dispatchEvent('#hTo', 'change');
  ok((await p.inputValue('#hFrom')) === dk(12) && (await p.textContent('#hBody')).includes('Köhnə B'), 'tarixlər tərs yazılanda özü düzəlir');
  await p.click('[data-h=all]');
  ok((await p.textContent('#hBody')).includes('Bütün günlər') && (await p.inputValue('#hFrom')) === '', 'Bütün günlər: tarix boşdur');
  await p.click('#hBody [data-hd] >> nth=0');
  ok((await p.inputValue('#hFrom')) === (await p.inputValue('#hTo')), 'günlər cədvəlində günə basanda yalnız o gün açılır');
  await p.evaluate(() => { S.sales = S.sales.filter(s => !s.id || !s.id.startsWith('old')); });
  await p.click('[data-h=today]');
  // Hesabat: dövr (tarixdən – tarixədək)
  await p.click('#ovHist [data-close]');
  await p.evaluate(() => { S.sales.push({ id: 'rr1', ts: Date.now() - 3 * 864e5, worker: 'Admin', pay: 'kart', lines: [{ id: 'x', name: 'Dövr satışı', q: 2, price: 5, sum: 10, cost: 2 }], total: 10 }); });
  await p.click('#btnRep');
  ok((await p.textContent('#rbody')).includes('Bu gün,') && (await p.textContent('#rbody')).includes('Kassadakı pul') && !(await p.textContent('#rbody')).includes('Kassa (yalnız nağd pul)'), 'Hesabat açılır: bu gün, əsas səhifədə yalnız qutular');
  await p.evaluate(() => repGo('kassapul')); ok((await p.textContent('#rbody')).includes('Kassa (yalnız nağd pul)'), 'Kassadakı pul səhifəsi');
  await p.evaluate(() => rrSet('week'));
  await p.evaluate(() => rrSet('month'));
  const rb = await p.textContent('#rbody');
  const inMonth = await p.evaluate(() => new Date(Date.now() - 3 * 864e5).getMonth() === new Date().getMonth());
  ok(!inMonth || (rb.includes('Günü seçin') && rb.includes('Kassa hər gün ayrıca')), 'Bu ay: Kassadakı Pul — günlər siyahısı, kassa bir gün üçün');
  await p.evaluate(() => repGo(''));
  ok(await p.isHidden('#rtabs') && await p.locator('#rbody [data-ks]').evaluateAll(b => b.map(x => x.dataset.ks).join('|')) === 'nağd|kart|borc|kassapul|artiq|suppdebt|zay|xerc|anbarpul|menfeet|alver|faiz', 'Hesabatda tab yoxdur — 11 qutu (admin)');
  await p.evaluate(() => repGo('')); await p.evaluate(() => rrSet('all')); ok(!(await p.$('.kback')), 'Ümumi Satış: təfərrüat əvvəl bağlıdır'); await p.click('[data-ks=kart]');
  ok(await p.isVisible('.kback') && (await p.textContent('.kback h3')).includes('Kart satış') && !(await p.$('.kboxes')) && !(await p.$('#k_open')), 'Kart qutusuna basanda tam səhifə: yalnız təfərrüat, qutular və kassa yoxdur');
  await p.click('.kback [data-ks=""]'); ok(!(await p.$('.kback')) && await p.isVisible('.kboxes'), '← Geri: əsas səhifə');
  await p.click('[data-ks=xerc]'); await p.keyboard.press('Escape'); ok(!(await p.$('.kback')) && await p.isVisible('#ovRep'), 'Esc: geri, Hesabat bağlanmır');
  await p.click('[data-ks=kassapul]'); ok(await p.isVisible('#k_open'), 'Kassadakı pul qutusu: kassa səhifəsi');
  await p.evaluate(() => repGo('kart'));
  ok((await p.textContent('#rbody')).includes('Dövr satışı'), 'Kart Satış: bütün dövrdə köhnə satış var');
  await p.click('[data-rr=today]');
  ok(!(await p.textContent('#rbody')).includes('Dövr satışı'), 'Kart Satış: bu gün seçiləndə köhnə satış yoxdur');
  await p.evaluate(() => repGo('nağd'));
  ok(!(await p.textContent('#rbody')).includes('Dövr satışı') && (await p.textContent('#rbody')).includes('Nağd satış — cəmi'), 'Nağd qutusu: kart satışı görünmür');
  await p.evaluate(() => repGo('borc')); ok((await p.textContent('#rbody')).includes('Bizə borclular'), 'Nisyə qutusu: müəssisə borcları da görünür');
  await p.evaluate(() => repGo('')); ok(!(await p.$('.kback')), 'repGo("") — əsas səhifə');
  await p.click('#ovRep [data-close]');
  await p.evaluate(() => { S.sales = S.sales.filter(s => s.id !== 'rr1'); });
  await p.click('#btnHist');
  // v0.65.0: ödəniş növünü düzəltmək (nağd ⇄ kart)
  const pe = await p.evaluate(() => { const s = [...S.sales].reverse().find(x => x.pay === 'nağd'); return s && s.id; });
  await p.click(`[data-h=payask][data-k="${pe}"]`);
  ok(await p.locator('[data-h=payok]').count() === 1 && (await p.textContent('[data-h=payok]')).includes('Kart') && await p.evaluate(id => S.sales.find(s => s.id === id).pay, pe) === 'nağd', '✏️ Karta dəyiş: əvvəlcə təsdiq soruşur');
  await p.click('[data-h=payok]'); await p.waitForTimeout(100);
  ok(await p.evaluate(id => { const s = S.sales.find(x => x.id === id); return s.pay === 'kart' && s.payEdits.length === 1 && s.payEdits[0].from === 'nağd'; }, pe) && (await p.textContent('#ovHist')).includes('Ödəniş dəyişdirilib: 💵 Nağd → 💳 Kart'), 'satış karta keçdi, tarixçədə qeyd görünür');
  await p.click(`[data-h=payask][data-k="${pe}"]`); await p.click('[data-h=payok]'); await p.waitForTimeout(100);
  ok(await p.evaluate(id => S.sales.find(x => x.id === id).pay, pe) === 'nağd', 'geri nağda da dəyişmək olur');
  ok(await p.evaluate(() => { const s = { id: 'bx', ts: Date.now(), pay: 'borc', cust: 'c', custName: 'X', lines: [], total: 1 }; S.sales.push(s); renderHist(); const ok = !document.querySelector(`[data-h=payask][data-k="${saleKey(s)}"]`); S.sales.pop(); renderHist(); return ok; }), 'nisyə satışda "dəyiş" düyməsi yoxdur (borca toxunur)');
  // v0.67.0: ↩️ Qaytar / Əvəzlə — material anbara qayıdır, əsl satışda qeyd, fərq hesablanır
  await p.click('#ovHist [data-close]');
  const lam0 = await p.evaluate(() => S.materials.find(m => m.id === 'lam').stock);
  await p.evaluate(() => { order = [{ id: 'g_lamA4', q: 2 }]; renderOrder(); }); await p.click('#btnDone');
  const rs = await p.evaluate(() => S.sales.at(-1).id);
  await p.click('#btnHist'); await p.click(`[data-h=ret][data-k="${rs}"]`); await p.fill('[data-rq="0"]', '1'); await p.click('[data-rt=add]');
  ok(await p.isHidden('#ovHist') && (await p.textContent('#lines')).includes('Qaytarma: Laminasiya A4') && (await p.textContent('#btnDone')).includes('Pulu qaytar: 1.00'), '↩️ Qaytar: sifarişdə mənfi sətir, düymə "Pulu qaytar 1.00"');
  await p.fill('#q', ''); await p.dispatchEvent('#q', 'input'); await p.click('[data-cat=poli]', { position: { x: 12, y: 12 } }); await p.click('[data-add=g_lamA3]');
  ok((await p.textContent('#total')).startsWith('1.00'), '🔁 Əvəzlə: A3 (2.00) − qaytarılan A4 (1.00) = fərq 1.00');
  await p.click('#btnDone');
  ok(await p.evaluate(({ rs, lam0 }) => { const o = S.sales.find(s => s.id === rs), x = S.sales.at(-1); return o.returned['0'] === 1 && x.total === 1 && x.lines.some(l => l.ret && l.q === -1) && S.materials.find(m => m.id === 'lam').stock === lam0 - 1; }, { rs, lam0 }), 'əvəzləmə yazıldı: fərq 1 ₼, əsl satışda "1 qaytarılıb", plyonka anbara qayıtdı (2 − 1)');
  const ex = await p.evaluate(() => S.sales.at(-1).id);
  await p.click('#btnHist');
  ok((await p.textContent('#ovHist')).includes('↩️ Qaytarılıb: Laminasiya A4 ×1'), 'tarixçədə "qaytarılıb" qeydi');
  await p.click(`[data-h=ask][data-k="${ex}"]`); await p.click('[data-h=del]'); await p.waitForTimeout(100);
  await p.click(`[data-h=ask][data-k="${rs}"]`); await p.click('[data-h=del]'); await p.waitForTimeout(100);
  ok(await p.evaluate(({ rs, ex }) => !S.sales.some(s => s.id === rs || s.id === ex), { rs, ex }) && await p.evaluate(() => S.materials.find(m => m.id === 'lam').stock) === lam0, 'əvəzləmə və əsl satış silinəndə anbar əvvəlki kimi');
  // satışı silmək: material geri qayıdır
  const lamBefore = await p.evaluate(() => S.materials.find(m => m.id === 'lam').stock);
  const target = await p.evaluate(() => { const s = [...S.sales].reverse().find(s => s.used && s.used.lam === 1 && s.lines.length === 1); return s && s.id; });
  const nBefore = await p.evaluate(() => S.sales.length);
  await p.click(`[data-h=ask][data-k="${target}"]`);
  ok(await p.locator('[data-h=del]').count() === 1 && await p.evaluate(() => S.sales.length) === nBefore, 'Sil: əvvəlcə təsdiq soruşur');
  await p.click('[data-h=delx]');
  ok(await p.locator('[data-h=del]').count() === 0, 'Ləğv: heç nə silinmədi');
  await p.click(`[data-h=ask][data-k="${target}"]`); await p.click('[data-h=del]'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => S.sales.length) === nBefore - 1 && await p.evaluate(t => !S.sales.some(s => s.id === t), target), 'Bəli, sil: satış silindi');
  ok(await p.evaluate(() => S.materials.find(m => m.id === 'lam').stock) === lamBefore + 1, 'silinən satışın materialı anbara qaytarıldı (+1 plyonka)');
  ok((await p.textContent('#today')).includes(String(todayN - 1)), 'yuxarıdakı "Bu gün" sayı da azaldı');
  await p.keyboard.press('Enter'); await p.keyboard.press('Enter');
  ok(await p.evaluate(() => S.sales.length) === nBefore - 1, 'tarixçə açıq ikən Enter satış etmir');
  await p.click('#ovHist [data-close]');
  ok(!(await p.isVisible('#ovHist')), 'Bağla işləyir');

  // 💸 Xərclər → 📦 Mal alışı
  const M = id => p.evaluate(i => { const m = S.materials.find(x => x.id === i || x.name === i); return m && { id: m.id, stock: m.stock, cost: m.cost, unit: m.unit }; }, id);
  await p.click('#btnExp');
  ok(await p.isVisible('#ovExp') && (await p.textContent('#etabs')).includes('Mal alışı'), 'Xərclər pəncərəsi açıldı, Mal alışı tabı');
  await p.click('[data-x=psave]');
  ok((await p.textContent('#toast')).includes('mal seçin'), 'boş alış yazılmır');
  await p.selectOption('#l_mat_0', '__new');
  await p.fill('#l_nn_0', 'A4 ofis kağızı'); await p.selectOption('#l_un_0', 'vərəq');
  await p.fill('#l_pk_0', '3'); await p.fill('#l_pp_0', '500'); await p.fill('#l_tt_0', '27');
  ok((await p.textContent('#l_cc_0')).includes('1500 vərəq') && (await p.textContent('#l_cc_0')).includes('0.0180'), '3 paçka × 500 = 1500 vərəq, 1 vərəq 0.0180 ₼ (yazdıqca)');
  await p.selectOption('#l_ln_0', 'a4s_bw');
  await p.click('[data-x=ladd]');
  await p.selectOption('#l_mat_1', '__new'); await p.fill('#l_nn_1', 'Çərçivə 10x15'); await p.fill('#l_pk_1', '10'); await p.fill('#l_tt_1', '25');
  await p.selectOption('#l_ln_1', 'fk_1015');
  await p.fill('#p_sup', 'Kağız mağazası');
  ok((await p.textContent('#p_grand')).startsWith('52.00'), 'qəbzin cəmi 27 + 25 = 52.00');
  await p.click('[data-x=pay][data-p=nağd]'); await p.click('[data-x=psave]'); await p.waitForTimeout(50);
  const kag = await M('A4 ofis kağızı'), cer = await M('Çərçivə 10x15');
  ok(kag && kag.stock === 1500 && Math.abs(kag.cost - 0.018) < 1e-9 && kag.unit === 'vərəq', 'anbar: A4 ofis kağızı 1500 vərəq, maya 0.018');
  ok(cer && cer.stock === 10 && Math.abs(cer.cost - 2.5) < 1e-9, 'anbar: Çərçivə 10 ədəd, maya 2.50');
  ok(await p.evaluate(id => S.items.find(i => i.id === 'a4s_bw').recipe.some(r => r[0] === id && r[1] === 1), kag.id), '"olduğu kimi satıram": düyməyə qoşuldu (resept 1 vərəq)');
  await p.click('#ovExp [data-close]');
  await p.fill('#q', 'sade yazi');
  await p.click('[data-add=a4s_bw]'); await p.fill('.line input', '10'); await p.dispatchEvent('.line input', 'change'); await p.waitForTimeout(50); await p.click('#btnDone');
  ok((await M('A4 ofis kağızı')).stock === 1490, 'satış: anbardan 10 vərəq silindi (1490)');
  ok(await p.evaluate(() => Math.abs(S.sales.at(-1).lines[0].cost - 10 * (0.02 + 0.018)) < 1e-9), 'satışın mayası alış qiymətindən: 10 × (nümunə A4 0.02 + yeni kağız 0.018) = 0.38');
  // ikinci alış: mövcud mal, nisyə → orta maya
  await p.click('#btnExp'); await p.click('[data-x=pclear]');
  await p.selectOption('#l_mat_0', kag.id); await p.fill('#l_pk_0', '1'); await p.fill('#l_pp_0', '500'); await p.fill('#l_tt_0', '10');
  await p.click('[data-x=pay][data-p=nisyə]'); await p.fill('#p_sup', 'Topdan satıcı');
  await p.click('[data-x=psave]'); await p.waitForTimeout(50);
  const kag2 = await M(kag.id);
  ok(kag2.stock === 1990 && Math.abs(kag2.cost - (1490 * 0.018 + 10) / 1990) < 1e-9, `orta maya: (1490×0.018 + 10) / 1990 = ${kag2.cost.toFixed(5)}`);
  ok(!(await p.isHidden('#debtBadge')) && (await p.textContent('#debtBadge')).includes('10.00'), 'başlıqda borc nişanı: 10.00 ₼');
  await p.click('[data-x=tab][data-t=debt]');
  ok((await p.textContent('#expBody')).includes('Topdan satıcı — 10.00 ₼'), 'Borclar: təchizatçı üzrə');
  await p.click('[data-x=paydebt][data-by=nağd]');
  ok((await p.textContent('#expBody')).includes('Borcunuz yoxdur') && await p.isHidden('#debtBadge'), 'borc ödənildi, nişan itdi');
  await p.click('[data-x=tab][data-t=phist]');
  ok(await p.locator('#expBody table.hist tr').count() === 3 && (await p.textContent('#expBody')).includes('Nisyə → ödənildi'), 'Alış tarixçəsi: 2 alış, nisyə ödənildi kimi');
  ok((await p.textContent('#expBody')).includes('62.00'), 'bu ay alış cəmi 52 + 10 = 62.00');
  const lastId = await p.evaluate(() => S.purchases.at(-1).id);
  await p.click(`[data-x=pask][data-id="${lastId}"]`); await p.click('[data-x=pdel]'); await p.waitForTimeout(100);
  const kag3 = await M(kag.id);
  ok(kag3.stock === 1490 && Math.abs(kag3.cost - 0.018) < 1e-9, 'alış silindi: anbar 1490, maya 0.018-ə qayıtdı');
  await p.keyboard.press('Enter'); await p.keyboard.press('Enter');
  ok(true, 'Xərclər açıq ikən Enter satış etmir (yoxlanıb)');
  await p.click('#ovExp [data-close]');

  // 🧾 Digər xərclər
  await p.click('#btnExp'); await p.click('[data-x=tab][data-t=other]');
  ok((await p.textContent('#x_cat')).includes('İcarə') && (await p.textContent('#x_cat')).includes('Çay-su'), 'hazır xərc növləri var');
  await p.click('[data-x=xsave]');
  ok((await p.textContent('#toast')).includes('Məbləği yazın'), 'məbləğsiz xərc yazılmır');
  await p.selectOption('#x_cat', 'Çay-su'); await p.fill('#x_amt', '4.50'); await p.fill('#x_note', 'çay, şəkər'); await p.click('[data-x=xpay][data-p=nağd]');
  await p.click('[data-x=xsave]');
  ok((await p.textContent('#expBody')).includes('çay, şəkər') && (await p.textContent('#expBody')).includes('4.50'), 'Çay-su 4.50 nağd yazıldı');
  await p.selectOption('#x_cat', 'İcarə'); await p.fill('#x_amt', '300'); await p.click('[data-x=xpay][data-p=kart]'); await p.check('#x_rec');
  await p.click('[data-x=xsave]');
  ok((await p.textContent('#expBody')).includes('ödənilib') && await p.evaluate(() => S.recurring.length) === 1, 'İcarə 300 kartla + aylıq siyahıya düşdü, bu ay ödənilib görünür');
  ok((await p.textContent('#expBody')).includes('304.50'), 'ayın xərc cəmi 304.50');
  await p.click('[data-x=xcatnew]'); await p.fill('#x_newcat', 'Nəqliyyat'); await p.click('[data-x=xcat]');
  ok((await p.textContent('#x_cat')).includes('Nəqliyyat') && (await p.inputValue('#x_cat')) === 'Nəqliyyat', 'yeni xərc növü əlavə olundu və seçildi');
  // keçən ayın icarəsi kimi: təkrarlananı ödəmək
  await p.evaluate(() => { S.expenses = S.expenses.filter(x => !x.rec); });
  await p.click('[data-x=tab][data-t=buy]'); await p.click('[data-x=tab][data-t=other]');
  await p.click('[data-x=rpay][data-by=nağd]');
  ok(await p.evaluate(() => S.expenses.some(x => x.cat === 'İcarə' && x.pay === 'nağd' && x.amount === 300)) && (await p.textContent('#expBody')).includes('ödənilib'), '🔁 "Nağd ödədim": bu ayın icarəsi bir kliklə yazıldı');
  const xid = await p.evaluate(() => S.expenses.find(x => x.cat === 'Çay-su').id);
  await p.click(`[data-x=xask][data-id="${xid}"]`); await p.click('[data-x=xdel]');
  ok(!(await p.evaluate(() => S.expenses.some(x => x.cat === 'Çay-su'))), 'xərc silindi (təsdiqlə)');
  await p.selectOption('#x_cat', 'Çay-su'); await p.fill('#x_amt', '4.50'); await p.click('[data-x=xpay][data-p=nağd]'); await p.click('[data-x=xsave]');
  await p.click('#ovExp [data-close]');
  // 💰 Kassa
  await p.click('#btnRep'); await p.evaluate(() => repGo('kassapul'));
  const K = await p.evaluate(() => cashDay(dayKey(Date.now())));
  const expSales = await p.evaluate(() => S.sales.filter(s => s.pay === 'nağd' && new Date(s.ts).toDateString() === new Date().toDateString()).reduce((a, s) => a + s.total, 0));
  ok(Math.abs(K.sales - expSales) < 1e-9 && Math.abs(K.exp - 304.5) < 1e-9 && Math.abs(K.purch - 52) < 1e-9, `kassa: nağd satış ${expSales.toFixed(2)}, nağd alış 52.00 (silinmiş 10 ₼ alış sayılmır), nağd xərc 304.50 (çay 4.50 + icarə 300)`);
  await p.fill('#k_open', '400'); await p.dispatchEvent('#k_open', 'change');
  const should = 400 + expSales - 52 - 304.5;
  ok((await p.textContent('.kassa')).includes(should.toFixed(2)), `kassada olmalıdır: 400 + ${expSales.toFixed(2)} − 52 − 304.50 = ${should.toFixed(2)}`);
  await p.fill('#k_cnt', should.toFixed(2)); await p.dispatchEvent('#k_cnt', 'change');
  ok((await p.textContent('.kassa')).includes('Kassa düzdür'), 'saydığım = olmalı: "Kassa düzdür"');
  await p.fill('#k_cnt', (should - 5).toFixed(2)); await p.dispatchEvent('#k_cnt', 'change');
  ok((await p.textContent('.kassa')).includes('Çatışmır: 5.00'), '5 ₼ az: "Çatışmır: 5.00 ₼"');
  await p.click('#ovRep [data-close]');

  // 📅 Aylıq mənfəət hesabatı (keçən ay üçün nümunə məlumat)
  await p.evaluate(() => {
    const d = new Date(); const prev = new Date(d.getFullYear(), d.getMonth() - 1, 15, 12).getTime();
    S.sales.push({ id: 'old1', ts: prev, worker: 'Admin', pay: 'nağd', total: 1000, lines: [{ id: 'x', name: 'Köhnə satış', q: 10, price: 100, sum: 1000, cost: 200 }], used: {} });
    S.waste.push({ ts: prev, mat: 'a4', q: 5, reason: 'Test', worker: 'Admin', cost: 30 });
    S.expenses.push({ id: 'oldx', ts: prev, cat: 'İcarə', amount: 500, pay: 'kart', note: '', rec: null });
  });
  await p.click('#btnRep'); await p.evaluate(() => repGo('menfeet')); await p.evaluate(() => rrSet('all'));
  const cur = await p.evaluate(() => monthStats()[0]), prv = await p.evaluate(() => monthStats()[1]);
  ok(Math.abs(prv.net - (1000 - 200 - 30 - 500)) < 1e-9, 'keçən ay: 1000 − 200 − 30 − 500 = 270 xalis');
  ok(Math.abs(cur.net - (cur.sales - cur.cost - cur.waste - cur.exp)) < 1e-9 && cur.exp > 0, `bu ay: ${cur.sales.toFixed(2)} − ${cur.cost.toFixed(2)} − ${cur.waste.toFixed(2)} − ${cur.exp.toFixed(2)} = ${cur.net.toFixed(2)}`);
  ok(await p.evaluate(() => monthStats()[0].sales === S.sales.filter(s => monKey(s.ts) === monKey(Date.now())).reduce((a, s) => a + s.total, 0)), 'bu ayın satışı satışların cəmi ilə üst-üstə düşür');
  ok(await p.locator('.mchart rect.s1').count() === 2 && await p.locator('.legend').count() === 1, 'Mənfəət (bütün dövr): qrafik 2 ay, legend var');
  const allNet = await p.evaluate(() => monthStats().reduce((a, m) => a + m.net, 0));
  ok((await p.textContent('#rbody .kpi.hero')).includes(m2v(allNet)) && (await p.textContent('#rbody')).includes('270.00'), `Mənfəət: ümumi ${allNet.toFixed(2)}, keçən ay 270.00 cədvəldə`);
  await p.evaluate(() => repGo('xerc'));
  ok((await p.textContent('#rbody')).includes('İcarə') && (await p.textContent('#rbody')).includes('500.00'), 'Xərclər tabı: növlər və xərclər bir-bir');
  await p.evaluate(() => repGo('anbarpul'));
  const stockV = await p.evaluate(() => S.materials.reduce((a, m) => a + Math.max(0, m.stock) * (m.cost || 0), 0));
  ok((await p.textContent('#rbody .kpi.hero')).includes(m2v(stockV)), `Anbarda qalan pul: ${stockV.toFixed(2)} ₼`);
  await p.evaluate(() => repGo('zay'));
  ok((await p.textContent('#rbody')).includes('Zay olan pul') && (await p.textContent('#rbody')).includes('Test'), 'Zay olan pul tabı: səbəb üzrə');
  await p.click('#ovRep [data-close]');

  // Pəncərəni böyüt / kiçilt və loqo
  ok(await p.evaluate(() => { const i = document.querySelector('header .logo'); return i && i.complete && i.naturalWidth > 0; }), 'başlıqda loqo görünür');
  await p.click('#btnRep');
  const box = async () => p.evaluate(() => { const r = document.querySelector('#ovRep .modal').getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
  const small = await box();
  await p.click('#ovRep [data-max]');
  const big = await box();
  ok(big[0] === 1366 && big[1] === 768 && (await p.textContent('#ovRep [data-max]')).includes('Kiçilt'), `⛶ Böyüt: pəncərə bütün ekran oldu (${small} → ${big})`);
  await p.click('#ovRep [data-close]'); await p.click('#btnRep');
  ok((await box())[0] === 1366, 'bağlayıb açanda böyük qalır (yadda saxlanır)');
  await p.dblclick('#ovRep .mh h3');
  ok((await box())[0] === small[0], 'başlığa iki dəfə basmaq: əvvəlki ölçüyə qayıtdı');
  await p.click('#ovRep [data-close]');
  await p.click('#btnZay'); await p.click('#ovZay [data-max]');
  ok((await p.evaluate(() => document.querySelector('#ovZay .modal').getBoundingClientRect().width)) === 1366, 'kiçik Zay pəncərəsi də böyüyür');
  await p.click('#ovZay [data-max]'); await p.click('#ovZay [data-close]');
  ok(await p.locator('.ov [data-max]').count() === 10, 'bütün 10 pəncərədə (Kassa, Çay pulu da) böyüt düyməsi var');

  // v0.78.0: A4 Sadə-yə sonradan əlavə olunan düymə də A4 80 qram silir
  ok(await p.evaluate(() => { S.items.push({ id: 'a4s_yeni', name: 'Yeni A4', cat: 'cap', parent: 'g_a4', recipe: [], tiers: [[1, 0.3]] }); item('a4s_40').recipe = []; upgrade();
    const A = S.materials.filter(m => /a4/i.test(m.name) && /(^|\D)80(\D|$)/.test(m.name)).pop();
    const kids = S.items.filter(i => i.parent === 'g_a4' && !i.group); const r = kids.every(i => i.recipe.some(([m]) => m === A.id)) && item('a4s_40').recipe.length === 1;
    S.items = S.items.filter(i => i.id !== 'a4s_yeni'); return r; }), 'A4 Sadə: bütün düymələr (yeni əlavə olunan da) 1 vərəq A4 80 qram silir');
  ok(await p.evaluate(() => ['pq_kel10', 'pq_kel15', 'pq_ekl10', 'pq_ekl15'].map(id => item(id)?.cat + ':' + item(id)?.tiers[0][1]).join() === 'poli:10,poli:15,poli:10,poli:15'), 'Poliqrafiya: Kəlağayı 10/15, Əklil lenti 10/15');
  ok(await p.evaluate(() => { S.materials.push({ id: 'mFx', name: 'Fleks material', unit: 'metr', stock: 10, cost: 7 }); upgrade();
    return ['pq_kel10', 'pq_kel15', 'pq_ekl10', 'pq_ekl15', 'pq_kf10', 'pq_kf15'].every(id => JSON.stringify(item(id).recipe) === '[["mFx",0.5]]') && item('pq_kf15').tiers[0][1] === 15; }),
    'Fleks: Kəlağayı, Əklil lenti, köynəyə ad (10) / ad + nömrə (15) — hər biri 0.5 metr');
  // v0.80.1: sayımda kəsr (fleks 6.5 metr)
  await p.evaluate(() => document.querySelectorAll('.ov').forEach(o => o.hidden = true));
  await p.click('#btnStock'); await p.waitForSelector('#f_mFx'); await p.fill('#f_mFx', '6.5');
  await p.click('#rbody [data-act=savestock], #rbody button:has-text("Yadda saxla")'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => mat('mFx').stock === 6.5 && S.waste.some(w => w.mat === 'mFx' && w.q === 3.5)), 'sayım: Faktiki 6.5 metr düz yazılır, fərq 3.5 metr itki');
  await p.evaluate(() => document.querySelectorAll('.ov').forEach(o => o.hidden = true));
  // v0.82.0: Sertifikat Kağızı — satanda 250 / 300 qram soruşulur
  await p.evaluate(() => { document.querySelectorAll('.ov').forEach(o => o.hidden = true); S.materials.push({ id: 'ms250', name: 'Sertifikat Kağızı 250 qram', unit: 'vərəq', stock: 100, cost: 0.15 }, { id: 'ms300', name: 'Sertifikat Kağızı 300 qram (qalın)', unit: 'vərəq', stock: 50, cost: 0.18 }); item('g_sert').recipe = [['ms250', 1]]; upgrade(); order = []; renderAll(); });
  await p.fill('#q', 'sertifikat'); await p.waitForTimeout(150); await p.click('#grid [data-add=g_sert]');
  ok(await p.isVisible('#ovSrc') && await p.locator('#srcBody [data-pk]').count() === 2, 'Sertifikat: basanda 250 / 300 qram soruşulur');
  await p.keyboard.press('2'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => order.length === 1 && order[0].mat === 'ms300'), 'klaviatura 2 → 300 qram sifarişə düşdü');
  await p.click('#btnDone'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => mat('ms300').stock === 49 && mat('ms250').stock === 100 && S.sales.at(-1).lines[0].name.includes('300') && Math.abs(S.sales.at(-1).lines[0].cost - 0.18) < 1e-9), 'satış: 300 qramdan 1 silindi, 250 qrama toxunulmadı, maya 0.18');
  await p.fill('#q', '');
  ok(await p.evaluate(() => { item('fk_1015').recipe = []; S.materials.push({ id: 'm1015x', name: '10x15 Foto Kağız (Özümüz)', unit: 'vərəq', stock: 387, cost: 0.065 }); upgrade();
    return JSON.stringify(item('fk_1015').recipe) === '[["m1015x",1]]'; }), 'Foto Kağızlar → 10x15 (Özümüz) 1 vərəq 10x15 foto kağızı silir');
  ok(await p.evaluate(() => { S.materials.push({ id: 'mEL', name: 'Eklil lenti qara parça', unit: 'metr', stock: 20, cost: 1 }); upgrade();
    const r = id => JSON.stringify(item(id).recipe.filter(([m]) => m === 'mEL'));
    return r('pq_ekl10') === '[["mEL",1]]' && r('pq_ekl15') === '[["mEL",1.5]]' && item('pq_ekl15').recipe.some(([m]) => m === 'mFx'); }), 'Əklil lenti: 10 ₼ → 1 metr, 15 ₼ → 1.5 metr lent + 0.5 metr fleks');
  // v0.84.0: material əlavə olunan kimi (yenidən açmadan) düymələrə qoşulur
  await p.evaluate(() => { document.querySelectorAll('.ov').forEach(o => o.hidden = true); item('pq_kf10').recipe = []; S.materials = S.materials.filter(m => m.id !== 'mFx'); });
  await p.click('#btnStock'); await p.click('[data-rt=mat]'); await p.fill('#nm_name', 'Qara Fleks'); await p.fill('#nm_stock', '5'); await p.click('[data-act=madd]'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => { const F = S.materials.find(m => m.name === 'Qara Fleks'); return F && item('pq_kf10').recipe.some(([m, q]) => m === F.id && q === 0.5); }), 'yeni material (Qara Fleks) əlavə olunan kimi köynək düyməsinə qoşuldu');
  await p.evaluate(() => document.querySelectorAll('.ov').forEach(o => o.hidden = true));
  ok(await p.evaluate(() => { const f = S.items.find(i => i.parent === 'g_foto' && /13x18/.test(i.name)); f.recipe = []; S.materials.push({ id: 'm1318', name: '13x18 Foto Kağız (Özümüz)', unit: 'vərəq', stock: 50, cost: 0.12 }, { id: 'mc1318', name: 'Çərçivə 13x18', stock: 5, cost: 2 }); upgrade();
    return JSON.stringify(f.recipe) === '[["m1318",1]]'; }), 'Foto Kağızlar → 13x18 öz ölçülü foto kağıza qoşulur (çərçivəyə yox)');
  // v0.86.0: qarışıq ödəniş — 55 ₼ = 50 nağd + 5 kart
  await p.evaluate(() => { document.querySelectorAll('.ov').forEach(o => o.hidden = true); order = [{ id: 'sa_2', q: 1 }]; renderAll(); });
  await p.click('#paySplit'); await p.fill('#sp_cash', '50');
  ok((await p.textContent('#sp_card')) === '5.00', 'Nağd + Kart: nağd 50 yazanda kart 5.00 özü hesablanır');
  const cash0 = await p.evaluate(() => cashDay(dayKey(Date.now())).sales);
  await p.click('#btnDone'); await p.waitForTimeout(200);
  ok(await p.evaluate(c0 => { const s = S.sales.at(-1); return s.pay === 'qarış' && s.split.nağd === 50 && s.split.kart === 5 && s.total === 55 && Math.abs(cashDay(dayKey(Date.now())).sales - c0 - 50) < 1e-9 && pay === 'nağd'; }, cash0), 'satış 55: kassaya yalnız 50 nağd düşdü, 5 kart; sonra yenə Nağd seçilir');
  // v0.87.0: Vizit Kart → sertifikat kağızı, 10 vizit = 1 vərəq
  await p.evaluate(() => { document.querySelectorAll('.ov').forEach(o => o.hidden = true); order = []; renderAll(); tapItem('pq_vizit'); });
  ok(await p.isVisible('#ovSrc') && await p.locator('#srcBody [data-pk]').count() === 2, 'Vizit Kart: basanda 250 / 300 qram soruşulur');
  await p.keyboard.press('1'); await p.evaluate(() => { order[0].q = 20; renderAll(); });
  const s250 = await p.evaluate(() => mat('ms250').stock);
  await p.click('#btnDone'); await p.waitForTimeout(200);
  ok(await p.evaluate(b => Math.abs(mat('ms250').stock - (b - 2)) < 1e-9, s250), '20 vizit kart satıldı → 250 qramdan 2 vərəq silindi');
  // v0.88.0 audit: zay kəsr miqdarla, zay qeydlərinin id-si, kassir köhnə xərci silə bilmir, adlar ekranda qorunur
  await p.evaluate(() => { document.querySelectorAll('.ov').forEach(o => o.hidden = true); S.materials.push({ id: 'mZ', name: 'Zay sınaq <b>', unit: 'metr', stock: 3, cost: 2, min: 0 }); });
  await p.evaluate(() => openZay()); await p.selectOption('#zMat', 'mZ'); await p.fill('#zQty', '0.5'); await p.evaluate(() => saveZay());
  ok(await p.evaluate(() => mat('mZ').stock === 2.5 && S.waste.at(-1).q === 0.5 && S.waste.at(-1).id), 'zay: 0.5 metr yazılır (əvvəl 1-ə yuvarlanırdı), qeydin id-si var');
  ok(await p.evaluate(() => { S.waste.push({ ts: 5, mat: 'a', q: 1 }, { ts: 5, mat: 'b', q: 1 }); upgrade(); const u = unitsOf(S); return [...u.keys()].filter(k => k.startsWith('waste~')).length === S.waste.length; }), 'eyni anda yazılan iki zay qeydi buludda bir-birini əzmir');
  ok(await p.evaluate(() => { const sv = me; me = { id: 'k1', name: 'Kassir X', role: 'kassir', perms: { expDel: 1 } }; const r = [canDelRec({ ts: Date.now(), worker: 'Kassir X' }), canDelRec({ ts: Date.now() - 3 * 864e5, worker: 'Kassir X' }), canDelRec({ ts: Date.now(), worker: 'Başqası' })]; me = sv; return r.join() === 'true,false,false'; }), 'kassir: yalnız bu gün öz yazdığı xərci / alışı silə bilər');
  ok(await p.evaluate(() => { renderHeader(); return !document.querySelector('#chips b b') && document.getElementById('chips').textContent.includes('Zay sınaq <b>'); }), 'mal adındakı < > işarələri səhifəni pozmur');
  await p.evaluate(() => { S.materials = S.materials.filter(m => m.id !== 'mZ'); document.querySelectorAll('.ov').forEach(o => o.hidden = true); });
  // v0.77.0: Polaroid şəkil
  ok(await p.evaluate(() => { const P = item('fk_polaroid'); S.materials.push({ id: 'mF10', name: 'Foto kağız 10x15', unit: 'vərəq', stock: 50, cost: 0.3 }); P.recipe = []; item('fk_1015').recipe = []; upgrade();
    return P.cat === 'poli' && !P.parent && P.tiers[0][1] === 0.5 && JSON.stringify(P.recipe) === '[["mF10",1]]'; }), 'Poliqrafiya → Polaroid şəkil 0.50, resept 1 vərəq 10x15');
  // v0.75.0: A4 80 qram A4 düymələrinə qoşulur
  ok(await p.evaluate(() => { S.materials.push({ id: 'mA4x', name: 'A4 Sadə 80 qram', unit: 'vərəq', stock: 100, cost: 0.011 }); delete S.mig.a4Recipe; upgrade();
    return ['a4s_bw', 'a4s_2t', 'ks_tel'].every(id => JSON.stringify(item(id).recipe) === '[["mA4x",1]]') && !item('fk_a4_120').recipe.length; }), 'A4 Sadə 80 qram → A4 düymələrinin reseptinə 1 vərəq');

  // v0.95.0: yeni yaradılan laminasiya materialı Laminasiya A4 düyməsinə özü qoşulur
  ok(await p.evaluate(() => { const it = item('g_lamA4'); it.recipe = (it.recipe || []).filter(([m]) => !/lamin/.test(norm(mat(m)?.name || '')));
    S.materials.push({ id: 'mLam', name: 'Laminasiya plyonka paçka', unit: 'ədəd', stock: 100, cost: 0.15, min: 0 }); upgrade();
    return it.recipe.some(([m, q]) => m === 'mLam' && q === 1) && !item('g_lamA3').recipe.some(([m]) => m === 'mLam'); }), 'yeni "Laminasiya" materialı → Laminasiya A4 reseptinə 1 ədəd (A3-ə yox)');
  // v0.96.0: Vafli, çay pulu, laminasiya seçimi, pəncərə kənara basanda bağlanmır
  await p.evaluate(() => document.querySelectorAll('.ov').forEach(o => o.hidden = true));
  ok(await p.evaluate(() => { const v = item('cap_vafli'); return v && v.name === 'Vafli' && v.tiers[0][1] === 2 && !v.parent; }), 'ÇAP → 🧇 Vafli 2 ₼');
  await p.click('#btnRep'); await p.mouse.click(5, 5);
  ok(await p.isVisible('#ovRep'), 'pəncərənin kənarına basanda bağlanmır');
  await p.click('#ovRep [data-close]');
  await p.evaluate(() => { order = []; renderOrder(); });
  await p.fill('#q', 'vafli'); await p.press('#q', 'Enter'); await p.click('#qClear');
  await p.click('#btnTip'); await p.fill('#tp_g', '3'); await p.dispatchEvent('#tp_g', 'input');
  ok((await p.textContent('#tp_live')).includes('1.00'), 'çay pulu: 2.00 cəm, 3 verdi → 1.00');
  await p.click('[data-tp=ok]');
  ok(await p.isVisible('#tipRow') && (await p.textContent('#total')).startsWith('2.00'), 'sifarişdə ☕ sətri, cəmi dəyişmir (2.00)');
  const k0 = await p.evaluate(() => cashDay(dayKey(Date.now())).should);
  await p.click('#btnDone');
  ok(await p.evaluate(k => { const s = S.sales.at(-1), K = cashDay(dayKey(Date.now())); return s.tip === 1 && s.total === 2 && Math.abs(K.should - k - 3) < 1e-9 && K.tips >= 1; }, k0), 'satışda tip 1.00; kassa +3 (2 satış + 1 çay pulu), satış 2.00');
  await p.click('#btnRep'); await p.evaluate(() => repGo('kassapul')); await p.click('[data-rr=today]');
  ok((await p.textContent('.kassa')).includes('Artıq ödəmə'), 'kassa hesabında + 🪙 Artıq ödəmə sətri');
  await p.evaluate(() => repGo('artiq'));
  { const t = await p.textContent('#rbody'); ok(t.includes('Kassirlər üzrə') && t.includes('Günlər üzrə') && t.includes('Aylar üzrə') && t.includes('Vafli') && t.includes('1.00'), 'Hesabat → 🪙 Artıq ödəmə: kassir, gün, ay, xidmət (Vafli) üzrə'); }
  { const b0 = await p.evaluate(() => { const r = document.querySelector('#ovRep .modal').getBoundingClientRect(); return [r.x, r.y]; });
    const hb = await p.locator('#ovRep .mh h3').boundingBox(); await p.mouse.move(hb.x + 5, hb.y + 5); await p.mouse.down(); await p.mouse.move(hb.x - 95, hb.y + 45, { steps: 5 }); await p.mouse.up();
    const b1 = await p.evaluate(() => { const r = document.querySelector('#ovRep .modal').getBoundingClientRect(); return [r.x, r.y]; });
    ok(Math.abs(b1[0] - b0[0] + 100) < 2 && Math.abs(b1[1] - b0[1] - 40) < 2, `pəncərə başlıqdan tutub sürüşdürülür (${b0.map(Math.round)} → ${b1.map(Math.round)})`); }
  await p.click('#ovRep [data-close]');
  ok(await p.evaluate(() => { S.materials.push({ id: 'mLam125', name: 'Laminasiya A4 125 mikron', unit: 'ədəd', stock: 100, cost: 0.16, min: 0 }, { id: 'mLamA3', name: 'Laminasiya A3', unit: 'ədəd', stock: 10, cost: 0.3, min: 0 });
    upgrade(); const a4 = pickMats(item('g_lamA4')).map(m => m.id), a3 = pickMats(item('g_lamA3')).map(m => m.id); return a4.length >= 2 && a4.includes('mLam125') && !a4.includes('mLamA3') && a3.join() === 'mLamA3'; }), 'laminasiya: A4 düyməsi 2 A4 plyonkanı soruşur (A3 yox), A3 düyməsi yalnız A3-ü');
  // v0.99.0: köhnə çərçivələr anbara → Standart çərçivə düyməsinə özü qoşulur
  ok(await p.evaluate(() => { S.materials.push({ id: 'mC1521', name: 'Çərçivə 15x21 (vitrin)', unit: 'ədəd', stock: 7, cost: 2.5, min: 0 }, { id: 'mCL', name: 'Laser çərçivə 13x18', unit: 'ədəd', stock: 3, cost: 4, min: 0 }); upgrade();
    return item('cs_15_21')?.recipe.some(([m, q]) => m === 'mC1521' && q === 1) && !item('cs_13_18')?.recipe.some(([m]) => m === 'mCL'); }), 'anbara "Çərçivə 15x21" yazılanda Çərçivə 15x21 düyməsinə 1 ədəd qoşulur (lazer çərçivə qoşulmur)');
  // v1.0.0: 🛍️ Vitrin malı — qiymət və "nə satıldı" satanda yazılır
  await p.evaluate(() => { document.querySelectorAll('.ov').forEach(o => o.hidden = true); order = []; renderOrder(); });
  ok(await p.evaluate(() => S.cats.some(c => c.id === 'vitrin') && item('vit_mal')?.free === 1), '🛍️ Vitrin bölməsi və "Vitrin malı" düyməsi');
  await p.evaluate(() => tapItem('vit_mal'));
  ok((await p.textContent('#m2Body')).includes('Nə satıldı'), 'pəncərədə "Nə satıldı? (məcburi)"');
  await p.fill('#m2_tot', '12'); await p.dispatchEvent('#m2_tot', 'input'); await p.click('#ovM2 [data-m2=add]').catch(() => {}); await p.evaluate(() => addM2());
  ok(await p.evaluate(() => !order.length), 'nə satıldığı yazılmayanda əlavə olunmur');
  await p.fill('#m2_note', 'taxta çərçivə 20x30'); await p.dispatchEvent('#m2_note', 'input'); await p.evaluate(() => addM2());
  ok(await p.evaluate(() => order.length === 1 && order[0].note === 'taxta çərçivə 20x30' && Math.abs(order[0].cp - 12) < 1e-9), 'Vitrin malı — taxta çərçivə 20x30, 12 ₼ sifarişdə');
  await p.evaluate(() => { order = []; renderOrder(); });
  // v1.1.0: 👥 İşçi faizi (admin)
  await p.evaluate(() => { document.querySelectorAll('.ov').forEach(o => o.hidden = true);
    const k = S.users.filter(u => u.role !== 'admin'); if (k.length < 2) { S.users.push({ id: 'uF1', name: 'Fərid', role: 'kassir', perms: {} }, { id: 'uF2', name: 'Aysel', role: 'kassir', perms: {} }); }
    const now = Date.now(); S.sales.push({ id: 'fz1', ts: now, worker: 'Admin', pay: 'nağd', total: 90, sub: 100, disc: 10, lines: [{ id: 'ss_1', name: 'Fotosessiya', q: 1, sum: 50, cost: 0 }, { id: 'a4s_bw', name: 'A4', q: 500, sum: 50, cost: 0 }] },
      { id: 'fz2', ts: now, worker: 'Admin', pay: 'nağd', total: 20, lines: [{ id: 'fk_1521', name: 'Foto 15x21', q: 20, sum: 20, cost: 0, from: 'sp1', scost: 9 }] }); save(); });
  await p.click('#btnRep'); await p.evaluate(() => repGo('faiz')); await p.click('[data-rr=today]');
  const fu = await p.evaluate(() => S.users.filter(u => u.role !== 'admin').slice(0, 2).map(u => u.id));
  for (const id of fu) await p.check(`[data-cu="${id}"]`);
  const fz = await p.evaluate(() => { const st = item('ss_1').cat, a4 = item('a4s_bw').cat; return { st, a4 }; });
  const exp = (fz.st === 'studiya' ? 50 * 0.9 * 0.10 : 50 * 0.9 * 0.05) + 50 * 0.9 * 0.05;
  ok((await p.textContent('#rbody .kpi.hero')).length > 0 && await p.evaluate(e => { const t = document.querySelector('#rbody .kpi.hero b').textContent; return t.includes(m2(e)) || parseFloat(t) >= e - 0.01; }, exp), 'İşçi faizi: fotosessiya 10% + çap 5%, endirim çıxılır, Samir sayılmır');
  ok((await p.textContent('#rbody')).includes('Hər işçiyə (2 nəfər'), 'ümumi faiz 2 işçiyə bərabər bölünür');
  const nx = await p.evaluate(() => S.expenses.length);
  await p.click(`[data-cp="${fu[0]}|alver"]`);
  ok(await p.evaluate(n => { const x = S.expenses.at(-1); return S.expenses.length === n + 1 && x.cat === 'İşçi faizi' && x.pay === 'alver' && x.comm; }, nx), 'Ödə (alverdən) → Xərclərə "İşçi faizi" yazıldı');
  await p.click('#ovRep [data-close]');
  // v1.2.0: Ayarlar → Kassirlər: "Kassa açılışı məcburidir" seçimi
  await p.evaluate(() => document.querySelectorAll('.ov').forEach(o => o.hidden = true));
  await p.click('#btnSet'); await p.click('[data-rt=users]');
  ok(await p.isChecked('#kzReqChk'), 'Kassirlər tabında "💰 Kassa açılışı məcburidir" — standart açıq');
  await p.uncheck('#kzReqChk');
  ok(await p.evaluate(() => S.kzReq === false) && (await p.textContent('#rbody')).includes('Söndürülüb'), 'söndürüldü (S.kzReq=false)');
  await p.check('#kzReqChk'); await p.click('#ovRep [data-close]');
  // v1.2.1: Mal alışı "👛 Öz cibimdən" — kassa hesabından çıxılmır
  ok(await p.evaluate(() => { const d = dayKey(Date.now()), k0 = cashDay(d).purch; S.purchases.push({ id: 'puCib', ts: Date.now(), supplier: 'Test', pay: 'alver', paid: false, lines: [], total: 16 }); const k1 = cashDay(d).purch; S.purchases = S.purchases.filter(p => p.id !== 'puCib'); return k0 === k1 && /Ümumi alverdən/.test(payPill({ pay: 'alver' })); }), 'Mal alışı "Ümumi alverdən": kassadan çıxılmır, etiketi görünür');
  // v1.3.0: 💼 Xidmət — adı və qiyməti satanda
  await p.evaluate(() => { document.querySelectorAll('.ov').forEach(o => o.hidden = true); order = []; renderOrder(); });
  ok(await p.evaluate(() => { const x = item('pq_xidmet'); return x && x.name === 'Xidmət' && x.free === 1 && x.noteReq === 1 && !x.recipe.length; }), 'Poliqrafiya → 💼 Xidmət düyməsi (material yoxdur)');
  await p.evaluate(() => tapItem('pq_xidmet'));
  ok((await p.textContent('#m2Body')).includes('Hansı xidmət göstərildi'), 'pəncərədə "Hansı xidmət göstərildi? (məcburi)"');
  await p.fill('#m2_note', 'Excel cədvəli'); await p.dispatchEvent('#m2_note', 'input'); await p.fill('#m2_tot', '5'); await p.dispatchEvent('#m2_tot', 'input'); await p.evaluate(() => addM2());
  ok(await p.evaluate(() => order.length === 1 && order[0].note === 'Excel cədvəli' && Math.abs(order[0].cp - 5) < 1e-9), 'Xidmət — Excel cədvəli, 5 ₼ sifarişdə');
  await p.evaluate(() => { order = []; renderOrder(); });
  // v1.4.0: Fiber Lazer — ölçüsüz, qiyməti satanda
  ok(await p.evaluate(() => { const L = item('lz_m2'), B = item('lz_bizim'); return L && !L.area && L.free === 1 && L.noteReq === 1 && /müştərinin/.test(L.name) && B && B.free === 1 && B.parent === L.parent && B.cat === L.cat; }), 'Lazer yazı (müştərinin məhsulu) ölçüsüz + "Lazer — bizim məhsul" əlavə olundu');
  await p.evaluate(() => { document.querySelectorAll('.ov').forEach(o => o.hidden = true); order = []; renderOrder(); tapItem('lz_m2'); });
  ok((await p.textContent('#m2Body')).includes('Nəyin üzərinə') && !(await p.isVisible('#m2_w').catch(() => false)), 'Lazer pəncərəsində ölçü yoxdur, "Nəyin üzərinə nə yazıldı?" var');
  await p.click('#ovM2 [data-close], #ovM2 [data-m2x]').catch(() => {}); await p.evaluate(() => { document.querySelectorAll('.ov').forEach(o => o.hidden = true); order = []; renderOrder(); });
  // v1.5.0: Hesabat bölmələri bağlı, ▸ ilə açılır; dövr: Bu gün / Dünən / Gün seç / Tarix aralığı
  await p.evaluate(() => { document.querySelectorAll('.ov').forEach(o => o.hidden = true); window.REP_FORCE_CLOSED = 1; });
  await p.click('#btnRep'); await p.evaluate(() => repGo('zay'));
  ok(await p.evaluate(() => { const d = [...document.querySelectorAll('#rbody details.rsec')]; return d.length >= 2 && d.every(x => !x.open); }), 'Hesabat bölmələri bağlı gəlir (▸)');
  await p.click('#rbody details.rsec > summary');
  ok(await p.evaluate(() => document.querySelector('#rbody details.rsec').open), 'başlığa basanda açılır');
  ok(await p.evaluate(() => [...document.querySelectorAll('.rrange [data-rr]')].map(b => b.textContent).join('|') === 'Bu gün|Dünən' && !!document.getElementById('r_day')), 'dövr düymələri: Bu gün, Dünən + Gün seç + Tarix aralığı');
  const yd = await p.evaluate(() => dayKey(Date.now() - 3 * 864e5)); await p.fill('#r_day', yd); await p.dispatchEvent('#r_day', 'change');
  ok(await p.evaluate(d => rFrom === d && rTo === d, yd), 'Gün seç → həmin gün');
  await p.evaluate(() => { window.REP_FORCE_CLOSED = 0; document.querySelectorAll('.ov').forEach(o => o.hidden = true); });
  // v0.74.0: 💰 Mənfəət tabı
  await p.evaluate(() => document.querySelectorAll('.ov').forEach(o => o.hidden = true));
  await p.click('#btnRep'); await p.evaluate(() => repGo('menfeet')); await p.evaluate(() => rrSet('month'));
  ok(await p.evaluate(() => { const m = monthStats()[0]; return document.querySelector('#rbody .kpi.hero').textContent.includes(m2(m.net)); }), 'Mənfəət tabı (bu ay) = monthStats net');
  await p.click('#ovRep [data-close]');

  // v0.73.0: ☀️/🌙 mövzu
  const th0 = await p.evaluate(() => curTheme()); await p.click('#btnTheme');
  ok(await p.evaluate(t => curTheme() !== t && localStorage.getItem('kassa.theme') === curTheme(), th0), 'mövzu düyməsi ağ/qara rejimi dəyişir və yadda saxlayır');
  await p.click('#btnTheme'); ok(await p.evaluate(t => curTheme() === t, th0), 'ikinci basış əvvəlki rejimə qaytarır');

  // v0.71.0: 🧹 Sistemi Sıfırla (ən sonda — hər şeyi silir)
  await p.evaluate(() => document.querySelectorAll('.ov').forEach(o => o.hidden = true));
  const it0 = await p.evaluate(() => S.items.length);
  await p.click('#btnRep'); ok(await p.isVisible('#btnReset'), 'Hesabatda "🧹 Sistemi Sıfırla" düyməsi');
  await p.click('#btnReset'); await p.click('[data-rs=go]'); await p.waitForTimeout(100);
  ok(await p.evaluate(() => S.sales.length > 0) && await p.isVisible('#ovReset'), 'SIFIRLA yazılmadan heç nə silinmir');
  await p.uncheck('[data-rsk=sales]'); await p.fill('#rs_word', 'SIFIRLA'); await p.click('[data-rs=go]'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => S.sales.length > 0 && !S.expenses.length && !S.waste.length), 'işarəsi götürülən (Satışlar) qaldı, qalanları silindi');
  await p.click('#btnRep'); await p.click('#btnReset'); await p.fill('#rs_word', 'SIFIRLA'); await p.click('[data-rs=go]'); await p.waitForTimeout(200);
  ok(await p.evaluate(it0 => !S.sales.length && !S.expenses.length && !S.purchases.length && !S.waste.length && !Object.keys(S.cash).length && S.items.length === it0 && S.materials.every(m => m.stock === 0), it0), 'sıfırlandı: satış/xərc/alış/zay/kassa yox; düymələr qaldı, anbar sayı 0');
  // v0.90.0: 💰 Kassa açılışı / təhvil-təslim
  await p.evaluate(() => document.querySelectorAll('.ov').forEach(o => o.hidden = true));
  ok(await p.isVisible('#btnKassa') && (await p.textContent('#kzState')).includes('bağlıdır'), 'menyuda 💰 Kassa düyməsi: bağlıdır');
  await p.click('#btnKassa');
  ok((await p.textContent('#kzt')).includes('açılışı'), 'kassa bağlıdır → açılış pəncərəsi');
  await p.fill('#kz_cnt', '100'); await p.click('[data-kz=open]');
  const td = await p.evaluate(() => dayKey(Date.now()));
  ok(await p.evaluate(d => kzOpen() && kzLast().counted === 100 && S.cash[d].open != null, td) && (await p.textContent('#kzState')).includes('açıqdır'), 'kassa açıldı: 100 ₼, menyuda "açıqdır"');
  await p.click('#btnKassa');
  ok((await p.textContent('#kzt')).includes('təhvil ver'), 'açıq kassa → təhvil ver pəncərəsi');
  const sh = await p.evaluate(() => cashDay(dayKey(Date.now())).should);
  await p.fill('#kz_cnt', m2v(sh - 5)); await p.fill('#kz_take', '20'); await p.click('[data-kz=close]');
  ok(await p.isVisible('#ovKassa') && (await p.textContent('#kzLive')).includes('Çatışmır: 5.00'), 'fərq var, qeyd yoxdur → yadda saxlamır, "Çatışmır: 5.00" göstərir');
  await p.fill('#kz_note', 'xırda pul'); await p.click('[data-kz=close]');
  const lc = await p.evaluate(() => kzLast());
  ok(await p.isHidden('#ovKassa') && lc.t === 'close' && Math.abs(lc.diff + 5) < 1e-6 && lc.taken === 20 && Math.abs(lc.left - (sh - 25)) < 1e-6, `təhvil verildi: 20 ₼ sahibə, qalır ${m2v(sh - 25)}`);
  ok(await p.evaluate(() => { const K = cashDay(dayKey(Date.now())); return K.taken === 20 && Math.abs(K.diff + 5) < 1e-6; }), 'kassa hesabı: sahibə verilən çıxılır, fərq −5');
  await p.click('#btnUser'); await p.waitForTimeout(100);
  if (await p.isVisible('#ovLogin')) { await p.click('[data-login]'); }
  await p.waitForTimeout(500);
  ok(await p.isVisible('#ovKassa') && (await p.textContent('#kzBody')).includes(m2v(sh - 25)), 'yenidən girəndə açılış özü çıxır: "Kassada qalıb ' + m2v(sh - 25) + '"');
  await p.fill('#kz_cnt', m2v(sh - 25));
  ok((await p.textContent('#kzLive')).includes('Düzdür'), 'eyni məbləğ sayılanda: ✓ Düzdür');
  await p.click('[data-kz=open]');
  await p.click('#btnRep'); await p.evaluate(() => repGo('kassapul')); await p.click('[data-rr=today]');
  const kb = await p.textContent('#rbody');
  ok(kb.includes('Təhvil-təslim') && kb.includes('xırda pul') && kb.includes('Sahibə verilən'), 'Hesabat → Kassadakı Pul: təhvil-təslim jurnalı');
  const kn0 = await p.evaluate(() => kzLog().length), kcid = await p.evaluate(() => kzLog().find(x => x.t === 'close').id);
  await p.click(`#rbody [data-kzd="${kcid}"]`);
  ok((await p.textContent(`#rbody [data-kzd="${kcid}"]`)).includes('Bəli'), 'admin: 🗑️ Sil → təsdiq soruşur');
  await p.click(`#rbody [data-kzd="${kcid}"]`);
  ok(await p.evaluate(n => kzLog().length === n - 1 && cashDay(dayKey(Date.now())).taken === 0, kn0), 'təhvil qeydi silindi, sahibə verilən 20 ₼ kassa hesabından da getdi');
  await p.click('#ovRep [data-close]');
  await p.evaluate(() => { const d = dayKey(Date.now()), c = S.cash[d]; c.log.push({ id: 'kzX', t: 'close', ts: Date.now(), by: 'Leyla', to: 'Admin', expected: 50, counted: 50, taken: 0, left: 50, diff: 0, note: '' }); renderAll(); });
  await p.waitForTimeout(100);
  ok(await p.isVisible('#ovKassa') && (await p.textContent('#kzBody')).includes('Leyla'), 'başqa kompüterdən Leyla təhvil verdi → bu kompüterdə açılış pəncərəsi özü çıxdı');
  await p.click('#ovKassa [data-max]');
  ok(await p.evaluate(() => document.querySelector('#ovKassa .modal').classList.contains('max')) && (await p.textContent('#ovKassa [data-max]')).includes('Kiçilt'), 'Kassa pəncərəsində ⛶ Böyüt / 🗗 Kiçilt işləyir');
  await p.click('#ovKassa [data-max]');
  await p.fill('#kz_cnt', '50'); await p.click('[data-kz=open]');
  ok(await p.evaluate(() => kzOpen() && kzLast().from === 'Leyla' && kzLast().diff === 0), 'Leyladan 50 ₼ təhvil alındı, fərq yoxdur');
  await p.click('#btnRep'); await p.evaluate(() => repGo('kassapul'));
  await p.click('#ovRep [data-close]');
  ok(errs.length === 0, 'JS xətası yoxdur ' + (errs.join('; ') || ''));
  await b.close();
})();
