
const DATA_URL='data.json';
let siteData=null;

async function loadData(){
  const saved=localStorage.getItem('goudenStapData');
  if(saved){siteData=JSON.parse(saved)}else{siteData=await (await fetch(DATA_URL)).json()}
  applyTheme(); renderCommon();
  if(document.body.dataset.page==='home') renderHome();
  if(document.body.dataset.page==='categories') renderCategories();
  if(document.body.dataset.page==='collection') renderCollection();
  if(document.body.dataset.page==='editor') renderEditor();
}
function saveData(){localStorage.setItem('goudenStapData',JSON.stringify(siteData)); applyTheme(); renderCommon(); toast('Wijzigingen opgeslagen.')}
function resetData(){if(confirm('Alles terugzetten naar de originele inhoud?')){localStorage.removeItem('goudenStapData');location.reload()}}
function applyTheme(){document.documentElement.style.setProperty('--primary',siteData.colors.primary);document.documentElement.style.setProperty('--accent',siteData.colors.accent);document.documentElement.style.setProperty('--light',siteData.colors.light);document.documentElement.style.setProperty('--text',siteData.colors.text)}
function renderCommon(){
  document.querySelectorAll('[data-site-name]').forEach(e=>e.textContent=siteData.siteName);
  document.querySelectorAll('[data-tagline]').forEach(e=>e.textContent=siteData.tagline);
  const yr=document.querySelector('[data-year]');if(yr)yr.textContent=new Date().getFullYear();
}
const img=(src,alt)=>`<img src="${src}" alt="${alt||''}" onerror="this.style.display='none'">`;
function renderHome(){
  set('heroEyebrow',siteData.heroEyebrow);set('heroTitle',siteData.heroTitle);set('heroText',siteData.heroText);
  set('aboutTitle',siteData.aboutTitle);set('aboutText',siteData.aboutText);set('craftTitle',siteData.craftTitle);set('craftText',siteData.craftText);set('ctaTitle',siteData.ctaTitle);set('ctaText',siteData.ctaText);set('contactTitle',siteData.contactTitle);
  const fav=[siteData.products[6],siteData.products[3],{name:'Instappers',description:'Praktisch, stijlvol en gemakkelijk.',image:'assets/home-instappers.jpg'}];
  document.getElementById('favoriteCards').innerHTML=fav.map(p=>`<article class="card">${img(p.image,p.name)}<div class="card-body"><h3>${p.name}</h3><p>${p.description}</p><a class="btn primary" href="collection.html">Bekijk stijl</a></div></article>`).join('');
  document.getElementById('aboutImage').src='assets/home-detail.jpg';document.getElementById('craftImage').src='assets/home-detail.jpg';
  document.getElementById('contactDetails').innerHTML=`<p>${siteData.contactEmail}</p><p>${siteData.contactPhone}</p><p>${siteData.contactAddress}</p>`;
}
function renderCategories(){
  set('catTitle','Voor ieder moment een stap');set('catSubtitle','Kies een categorie en bekijk de collectie.');
  document.getElementById('categoryGrid').innerHTML=siteData.categories.map(c=>`<article class="card category-card">${img(c.image,c.name)}<div class="card-body"><h3>${c.name}</h3><p>${c.description}</p><a class="btn primary" href="collection.html?cat=${encodeURIComponent(c.name)}">Bekijk collectie</a></div></article>`).join('');
}
let currentProduct=0;
function renderCollection(){
  set('collectionTitle','Vind jouw volgende stap');set('collectionSubtitle','Blader door de volledige collectie.');
  const cats=['Alle',...new Set(siteData.products.map(p=>p.category))];
  document.getElementById('filters').innerHTML=cats.map((c,i)=>`<button class="filter ${i===0?'active':''}" onclick="filterProducts('${c.replace(/'/g,"\\'")}',this)">${c}</button>`).join('');
  renderCarousel();
  document.getElementById('productChips').innerHTML=siteData.products.map((p,i)=>`<button class="chip" onclick="goProduct(${i})">${i+1}. ${p.name}</button>`).join('');
}
function filterProducts(cat,btn){document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));btn.classList.add('active');const list=cat==='Alle'?siteData.products:siteData.products.filter(p=>p.category===cat);currentProduct=siteData.products.indexOf(list[0]);renderCarousel()}
function renderCarousel(){
  const p=siteData.products[currentProduct]||siteData.products[0];
  document.getElementById('carouselImage').src=p.image;document.getElementById('productCategory').textContent=p.category;document.getElementById('productName').textContent=p.name;document.getElementById('productDescription').textContent=p.description;document.getElementById('productNumber').textContent=`${currentProduct+1} / ${siteData.products.length}`;const buy=document.getElementById('buyButton');if(buy){if(p.buyUrl){buy.href=p.buyUrl;buy.style.display='inline-block'}else{buy.removeAttribute('href');buy.style.display='none'}}
}
function prevProduct(){currentProduct=(currentProduct-1+siteData.products.length)%siteData.products.length;renderCarousel()}
function nextProduct(){currentProduct=(currentProduct+1)%siteData.products.length;renderCarousel()}
function goProduct(i){currentProduct=i;renderCarousel();window.scrollTo({top:350,behavior:'smooth'})}
function set(id,val){const e=document.getElementById(id);if(e)e.textContent=val}
function toast(t){const e=document.querySelector('.toast');if(!e)return;e.textContent=t;e.style.display='block';setTimeout(()=>e.style.display='none',1800)}
function downloadJSON(){
  const blob=new Blob([JSON.stringify(siteData,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='de-gouden-stap-data.json';a.click();URL.revokeObjectURL(a.href)
}
function importJSON(ev){const f=ev.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{siteData=JSON.parse(r.result);saveData();renderEditor()}catch(e){alert('Dit JSON-bestand is ongeldig.')}};r.readAsText(f)}
function bindImage(input,callback){const f=input.files[0];if(!f)return;const r=new FileReader();r.onload=()=>callback(r.result);r.readAsDataURL(f)}
function renderEditor(){
 const root=document.getElementById('editorRoot'); if(!root)return;
 root.innerHTML=`
 <div class="panel full"><h2>Algemene gegevens</h2><div class="editor-grid">
 ${field('siteName','Naam',siteData.siteName)}${field('tagline','Tagline',siteData.tagline)}
 ${field('heroEyebrow','Hero label',siteData.heroEyebrow)}${field('heroTitle','Hero titel',siteData.heroTitle)}
 ${area('heroText','Hero tekst',siteData.heroText)}${area('aboutText','Over ons tekst',siteData.aboutText)}
 ${field('aboutTitle','Over ons titel',siteData.aboutTitle)}${field('craftTitle','Vakmanschap titel',siteData.craftTitle)}
 ${area('craftText','Vakmanschap tekst',siteData.craftText)}${field('ctaTitle','CTA titel',siteData.ctaTitle)}
 ${field('ctaText','CTA tekst',siteData.ctaText)}${field('contactTitle','Contact titel',siteData.contactTitle)}
 ${field('contactEmail','E-mail',siteData.contactEmail)}${field('contactPhone','Telefoon',siteData.contactPhone)}${field('contactAddress','Adres',siteData.contactAddress)}
 </div></div>
 <div class="panel"><h2>Kleuren</h2>${field('colorPrimary','Primaire kleur',siteData.colors.primary,'color')}${field('colorAccent','Accentkleur',siteData.colors.accent,'color')}${field('colorLight','Lichte achtergrond',siteData.colors.light,'color')}${field('colorText','Tekstkleur',siteData.colors.text,'color')}</div>
 <div class="panel"><h2>Gegevens bewaren</h2><p>Wijzigingen worden in deze browser bewaard.</p><button class="btn primary" onclick="collectAndSave()">Opslaan</button> <button class="btn" onclick="downloadJSON()">JSON exporteren</button><label class="btn">JSON importeren<input type="file" accept=".json" onchange="importJSON(event)" hidden></label><button class="btn" onclick="resetData()">Reset</button></div>
 <div class="panel full"><h2>Categorieën</h2><div id="catEditor" class="edit-list"></div><button class="btn primary" onclick="addCategory()">+ Categorie toevoegen</button></div>
 <div class="panel full"><h2>Producten</h2><div id="productEditor" class="edit-list"></div><button class="btn primary" onclick="addProduct()">+ Product toevoegen</button></div>`;
 renderEditLists();
}
function field(id,label,value,type='text'){return `<div class="field"><label>${label}</label><input id="${id}" type="${type}" value="${esc(value)}"></div>`}
function area(id,label,value){return `<div class="field"><label>${label}</label><textarea id="${id}">${esc(value)}</textarea></div>`}
function esc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;')}
function renderEditLists(){
 document.getElementById('catEditor').innerHTML=siteData.categories.map((c,i)=>`<div class="edit-item"><div class="edit-item-head"><strong>Categorie ${i+1}</strong><button class="danger" onclick="removeCategory(${i})">Verwijderen</button></div>${field(`cat-name-${i}`,'Naam',c.name)}${area(`cat-desc-${i}`,'Beschrijving',c.description)}<div class="field"><label>Afbeelding</label><input type="file" accept="image/*" onchange="bindImage(this,v=>siteData.categories[${i}].image=v)"><small>Huidig: ${c.image.startsWith('data:')?'aangepaste upload':c.image}</small></div></div>`).join('');
 document.getElementById('productEditor').innerHTML=siteData.products.map((p,i)=>`<div class="edit-item"><div class="edit-item-head"><strong>Product ${i+1}</strong><button class="danger" onclick="removeProduct(${i})">Verwijderen</button></div>${field(`prod-name-${i}`,'Naam',p.name)}${field(`prod-cat-${i}`,'Categorie',p.category)}${area(`prod-desc-${i}`,'Beschrijving',p.description)}${field(`prod-url-${i}`,'Koop URL / Buy Button URL',p.buyUrl||'')}<div class="field"><label>Afbeelding</label><input type="file" accept="image/*" onchange="bindImage(this,v=>siteData.products[${i}].image=v)"><small>Huidig: ${p.image.startsWith('data:')?'aangepaste upload':p.image}</small></div></div>`).join('');
}
function collectAndSave(){
 siteData.siteName=document.getElementById('siteName').value;siteData.tagline=document.getElementById('tagline').value;siteData.heroEyebrow=document.getElementById('heroEyebrow').value;siteData.heroTitle=document.getElementById('heroTitle').value;siteData.heroText=document.getElementById('heroText').value;siteData.aboutTitle=document.getElementById('aboutTitle').value;siteData.aboutText=document.getElementById('aboutText').value;siteData.craftTitle=document.getElementById('craftTitle').value;siteData.craftText=document.getElementById('craftText').value;siteData.ctaTitle=document.getElementById('ctaTitle').value;siteData.ctaText=document.getElementById('ctaText').value;siteData.contactTitle=document.getElementById('contactTitle').value;siteData.contactEmail=document.getElementById('contactEmail').value;siteData.contactPhone=document.getElementById('contactPhone').value;siteData.contactAddress=document.getElementById('contactAddress').value;
 siteData.colors.primary=document.getElementById('colorPrimary').value;siteData.colors.accent=document.getElementById('colorAccent').value;siteData.colors.light=document.getElementById('colorLight').value;siteData.colors.text=document.getElementById('colorText').value;
 siteData.categories.forEach((c,i)=>{c.name=document.getElementById(`cat-name-${i}`).value;c.description=document.getElementById(`cat-desc-${i}`).value});
 siteData.products.forEach((p,i)=>{p.name=document.getElementById(`prod-name-${i}`).value;p.category=document.getElementById(`prod-cat-${i}`).value;p.description=document.getElementById(`prod-desc-${i}`).value;p.buyUrl=document.getElementById(`prod-url-${i}`).value.trim()});
 saveData();
}
function addCategory(){siteData.categories.push({name:'Nieuwe categorie',description:'Korte beschrijving.',image:'assets/casual.jpg'});renderEditor()}
function removeCategory(i){if(confirm('Categorie verwijderen?')){siteData.categories.splice(i,1);renderEditor()}}
function addProduct(){siteData.products.push({name:'Nieuw product',category:'Casual',description:'Korte productbeschrijving.',image:'assets/casual.jpg',buyUrl:''});renderEditor()}
function removeProduct(i){if(confirm('Product verwijderen?')){siteData.products.splice(i,1);renderEditor()}}
document.addEventListener('DOMContentLoaded',loadData);
