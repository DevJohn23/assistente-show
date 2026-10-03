const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Fetching existing tecnicos from Supabase...');
  const { data: existingTecnicos, error } = await supabase.from('tecnicos').select('*');
  if (error) {
    console.error('Error fetching tecnicos:', error);
    return;
  }
  console.log(`Found ${existingTecnicos.length} tecnicos in database.`);

  const kmlData = fs.readFileSync('/home/marcos/Área de trabalho/assistente show/full_map.kml', 'utf-8');
  const placemarks = kmlData.split('<Placemark>').slice(1);
  console.log(`Found ${placemarks.length} placemarks in KML.`);

  const newTecnicos = [];
  
  for (const pm of placemarks) {
    const nameMatch = pm.match(/<name>([\s\S]*?)<\/name>/);
    const descMatch = pm.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/);
    const coordMatch = pm.match(/<coordinates>\s*([\-\d\.]+),([\-\d\.]+),/);

    if (nameMatch && coordMatch) {
      const name = nameMatch[1].trim();
      const lng = parseFloat(coordMatch[1]);
      const lat = parseFloat(coordMatch[2]);
      
      let desc = '';
      if (descMatch) {
        desc = descMatch[1].trim();
      }

      let categoria = '';
      let tipo = '';
      let telefone = '';
      let email = '';
      let vendedor_parceiro = '';
      
      if (name.includes('REDE PLUS')) categoria = 'REDE PLUS';
      else if (name.includes('PSO')) categoria = 'PSO C/ESTOQUE AVANÇADO';
      else if (name.includes('ATA')) categoria = 'ATA';
      else if (name.includes('SPOT')) categoria = 'SPOT';
      else categoria = 'OUTROS';
      
      if (desc.includes('Fixo') || desc.includes('FIXO') || desc.includes('FX')) tipo = 'Fixo';
      else if (desc.includes('Volante') || desc.includes('VOLANTE') || desc.includes('V-')) tipo = 'Volante';
      
      const emailMatch = desc.match(/E-mail:\s*([^\s<]+)/) || desc.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
      if (emailMatch) email = emailMatch[1];
      
      const phoneMatch = desc.match(/\(?\d{2}\)?\s*\d{4,5}\-\d{4}/);
      if (phoneMatch) telefone = phoneMatch[0];
      
      const supMatch = desc.match(/Supervisor:\s*(.*)/) || desc.match(/Parceiro:\s*(.*)/);
      if (supMatch) vendedor_parceiro = supMatch[1].replace(/<[^>]*>?/gm, '').trim();
      
      newTecnicos.push({
        nome: name,
        categoria,
        tipo,
        descricao: desc,
        telefone,
        email,
        lat,
        lng,
        vendedor_parceiro
      });
    }
  }

  let added = [];
  let updated = [];
  let unchanged = 0;
  
  for (const nt of newTecnicos) {
    const existing = existingTecnicos.find(et => et.nome === nt.nome);
    if (!existing) {
      added.push(nt);
    } else {
      if (existing.lat !== nt.lat || existing.lng !== nt.lng || existing.email !== nt.email || existing.telefone !== nt.telefone || existing.descricao !== nt.descricao) {
        updated.push({ oldId: existing.id, newData: nt });
      } else {
        unchanged++;
      }
    }
  }
  
  console.log(`Changes detected: ${added.length} added, ${updated.length} updated, ${unchanged} unchanged.`);
  
  let sqlStr = '';
  for (const nt of added) {
    console.log(`Adding ${nt.nome}`);
    sqlStr += `INSERT INTO public.tecnicos (nome, categoria, tipo, descricao, telefone, email, lat, lng, vendedor_parceiro) VALUES ('${nt.nome.replace(/'/g, "''")}', '${nt.categoria}', '${nt.tipo}', '${nt.descricao.replace(/'/g, "''")}', '${nt.telefone}', '${nt.email}', ${nt.lat}, ${nt.lng}, '${nt.vendedor_parceiro.replace(/'/g, "''")}');\n`;
  }
  fs.writeFileSync('novos_tecnicos.sql', sqlStr);
  console.log('SQL generated for new tecnicos in novos_tecnicos.sql');
  
  // Skip updates since we already did them

  console.log('Update complete.');
}

run();
