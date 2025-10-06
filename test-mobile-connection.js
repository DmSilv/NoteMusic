// Script específico para testar conexão do celular
const http = require('http');

console.log('📱 TESTE DE CONEXÃO PARA CELULAR FÍSICO\n');

// Testar diferentes cenários de conexão
const testScenarios = [
  {
    name: 'Teste 1: Rota básica do backend',
    url: 'http://192.168.1.8:3333/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.com', password: '123456' })
  },
  {
    name: 'Teste 2: Verificar se backend responde',
    url: 'http://192.168.1.8:3333/api',
    method: 'GET'
  },
  {
    name: 'Teste 3: Verificar CORS',
    url: 'http://192.168.1.8:3333/api/auth/login',
    method: 'OPTIONS'
  }
];

function makeRequest(scenario) {
  return new Promise((resolve) => {
    console.log(`🔍 ${scenario.name}`);
    
    const url = new URL(scenario.url);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: scenario.method,
      headers: scenario.headers || {}
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
        console.log(`   Resposta: ${data.substring(0, 200)}...`);
        
        if (res.statusCode === 200 || res.statusCode === 400) {
          console.log(`   ✅ SUCESSO: Backend está respondendo`);
        } else {
          console.log(`   ❌ ERRO: Status inesperado`);
        }
        
        console.log('');
        resolve(true);
      });
    });
    
    req.on('error', (err) => {
      console.log(`   ❌ ERRO: ${err.message}`);
      console.log(`   💡 Possível causa: Firewall, rede ou backend não rodando`);
      console.log('');
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log(`   ❌ TIMEOUT: Requisição demorou muito`);
      console.log(`   💡 Possível causa: Rede lenta ou backend sobrecarregado`);
      console.log('');
      req.destroy();
      resolve(false);
    });
    
    req.setTimeout(10000); // 10 segundos
    
    if (scenario.body) {
      req.write(scenario.body);
    }
    
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Iniciando testes de conectividade...\n');
  
  for (const scenario of testScenarios) {
    await makeRequest(scenario);
  }
  
  console.log('🏁 Testes concluídos!\n');
  console.log('📋 PRÓXIMOS PASSOS:');
  console.log('1. Se todos os testes falharam: Verificar se backend está rodando');
  console.log('2. Se alguns funcionaram: Verificar configuração de rede');
  console.log('3. Se CORS falhou: Verificar configuração do backend');
  console.log('4. Se tudo funcionou: Problema pode ser no app mobile');
}

runTests().catch(console.error);




