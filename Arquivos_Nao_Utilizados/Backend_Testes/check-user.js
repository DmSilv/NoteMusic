const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./src/models/User');

const checkUser = async () => {
  try {
    // Conectar ao banco
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Buscar usuário
    const user = await User.findOne({ email: 'teste@notemusic.com' }).select('+password');
    
    if (user) {
      console.log('✅ Usuário encontrado:');
      console.log('   Nome:', user.name);
      console.log('   Email:', user.email);
      console.log('   Senha hash:', user.password);
      console.log('   Nível:', user.level);
      console.log('   Ativo:', user.isActive);
      
      // Testar comparação de senha
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare('senha123', user.password);
      console.log('   Senha correta:', isMatch);
    } else {
      console.log('❌ Usuário não encontrado');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
};

checkUser(); 