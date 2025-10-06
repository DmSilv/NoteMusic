// Script para debugar conectividade entre celular e backend
const http = require('http');
const net = require('net');

console.log('🔍 DEBUG DE CONECTIVIDADE - CELULAR FÍSICO\n');

// 1. Verificar se a porta está aberta
function testPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 3000;
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      console.log(`✅ Porta ${port} está ABERTA em ${host}`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`❌ Porta ${port} está FECHADA em ${host} (timeout)`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (err) => {
      console.log(`❌ Porta ${port} está FECHADA em ${host} (${err.message})`);
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

// 2. Testar requisição HTTP
function testHttpRequest(host, port) {
  return new Promise((resolve) => {
    const options = {
      hostname: host,
      port: port,
      path: '/api/auth/basic-info',
      method: 'GET',
      timeout: 5000
    };
    
    const req = http.request(options, (res) => {
      console.log(`✅ HTTP Request: Status ${res.statusCode}`);
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`   Resposta: ${data.substring(0, 100)}...`);
        resolve(true);
      });
    });
    
    req.on('timeout', () => {
      console.log(`❌ HTTP Request: Timeout`);
      req.destroy();
      resolve(false);
    });
    
    req.on('error', (err) => {
      console.log(`❌ HTTP Request: ${err.message}`);
      resolve(false);
    });
    
    req.end();
  });
}

// 3. Executar testes
async function runTests() {
  const hosts = [
    'localhost',
    '127.0.0.1', 
    '192.168.1.8',
    '0.0.0.0'
  ];
  
  const port = 3333;
  
  console.log('📡 Testando conectividade...\n');
  
  for (const host of hosts) {
    console.log(`🔍 Testando ${host}:${port}`);
    
    // Testar porta
    const portOpen = await testPort(host, port);
    
    if (portOpen) {
      // Testar HTTP
      await testHttpRequest(host, port);
    }
    
    console.log('');
  }
  
  console.log('🏁 Teste concluído!');
  console.log('\n💡 DICAS:');
  console.log('- Se localhost funciona mas 192.168.1.8 não, é problema de rede');
  console.log('- Se nenhum funciona, o backend não está rodando');
  console.log('- Se porta está fechada, verificar firewall');
}

runTests().catch(console.error);




