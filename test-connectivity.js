// Script para testar conectividade com o backend
const fetch = require('node-fetch');

const testEndpoints = [
  'http://localhost:3333/api',
  'http://192.168.1.8:3333/api',
  'http://127.0.0.1:3333/api'
];

async function testConnectivity() {
  console.log('🔍 Testando conectividade com o backend...\n');
  
  for (const endpoint of testEndpoints) {
    try {
      console.log(`📡 Testando: ${endpoint}`);
      const response = await fetch(`${endpoint}/auth/basic-info`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        console.log(`✅ SUCESSO: ${endpoint} está acessível`);
        const data = await response.json();
        console.log(`   Resposta: ${JSON.stringify(data).substring(0, 100)}...`);
      } else {
        console.log(`❌ ERRO: ${endpoint} retornou status ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ FALHA: ${endpoint} - ${error.message}`);
    }
    console.log('');
  }
  
  console.log('🏁 Teste de conectividade concluído!');
}

testConnectivity().catch(console.error);




