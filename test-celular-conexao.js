// Script para testar especificamente a conexão do celular
const http = require('http');

console.log('📱 TESTE ESPECÍFICO PARA CELULAR FÍSICO\n');

// Simular exatamente o que o app mobile faz
const testMobileConnection = () => {
  return new Promise((resolve) => {
    const options = {
      hostname: '192.168.1.8',
      port: 3333,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Expo/React Native',
        'Accept': 'application/json'
      }
    };
    
    console.log('🔍 Simulando requisição do app mobile...');
    console.log(`   URL: http://${options.hostname}:${options.port}${options.path}`);
    console.log(`   Method: ${options.method}`);
    console.log(`   Headers: ${JSON.stringify(options.headers, null, 2)}`);
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\n📊 RESULTADO:');
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Headers de Resposta:`);
        console.log(`     - Content-Type: ${res.headers['content-type']}`);
        console.log(`     - CORS Headers: ${JSON.stringify({
          'access-control-allow-origin': res.headers['access-control-allow-origin'],
          'access-control-allow-methods': res.headers['access-control-allow-methods'],
          'access-control-allow-headers': res.headers['access-control-allow-headers'],
          'access-control-allow-credentials': res.headers['access-control-allow-credentials']
        }, null, 2)}`);
        console.log(`   Resposta: ${data}`);
        
        if (res.statusCode === 200 || res.statusCode === 400 || res.statusCode === 401) {
          console.log('\n✅ SUCESSO: Backend está acessível do celular!');
          console.log('   O problema pode estar na configuração do app mobile.');
        } else {
          console.log('\n❌ ERRO: Backend não está respondendo corretamente.');
        }
        
        resolve(true);
      });
    });
    
    req.on('error', (err) => {
      console.log('\n❌ ERRO DE CONEXÃO:');
      console.log(`   ${err.message}`);
      console.log('\n💡 POSSÍVEIS CAUSAS:');
      console.log('   1. Firewall do Windows bloqueando');
      console.log('   2. Antivírus interferindo');
      console.log('   3. Rede com isolamento de dispositivos');
      console.log('   4. Backend não está rodando');
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('\n⏰ TIMEOUT:');
      console.log('   Requisição demorou muito para responder');
      console.log('   Verificar se backend está rodando');
      req.destroy();
      resolve(false);
    });
    
    req.setTimeout(10000);
    
    // Enviar dados de login de teste
    const loginData = JSON.stringify({
      email: 'test@test.com',
      password: '123456'
    });
    
    req.write(loginData);
    req.end();
  });
};

// Executar teste
testMobileConnection().then(() => {
  console.log('\n🏁 Teste concluído!');
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('1. Se deu SUCESSO: O problema está no app mobile');
  console.log('2. Se deu ERRO: Verificar configurações de rede');
  console.log('3. Se deu TIMEOUT: Backend pode não estar rodando');
}).catch(console.error);




