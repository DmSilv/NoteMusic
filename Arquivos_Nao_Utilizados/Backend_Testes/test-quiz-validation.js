const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao banco de dados
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');

// Importar modelo
const Quiz = require('./src/models/Quiz');

async function testQuizValidation() {
  try {
    console.log('🧪 Testando validação de questões específicas...');
    
    // Buscar o quiz específico que está sendo usado
    const quiz = await Quiz.findById('689d1cbca9442adf708f40c8');
    
    if (!quiz) {
      console.log('❌ Quiz não encontrado');
      return;
    }
    
    console.log(`📝 Quiz: ${quiz.title}`);
    console.log(`  ID: ${quiz._id}`);
    console.log(`  Total de questões: ${quiz.questions.length}`);
    
    // Testar cada questão
    quiz.questions.forEach((question, qIndex) => {
      console.log(`\n🔍 Questão ${qIndex + 1}: ${question.question}`);
      console.log(`  Opções:`);
      
      question.options.forEach((option, optIndex) => {
        console.log(`    ${optIndex}: "${option.label}" - isCorrect: ${option.isCorrect}`);
      });
      
      // Encontrar a opção correta
      const correctIndex = question.options.findIndex(opt => opt.isCorrect === true);
      console.log(`  ✅ Opção correta: índice ${correctIndex}`);
      
      // Testar todas as respostas possíveis
      console.log(`  🧪 Testando todas as respostas:`);
      question.options.forEach((option, optIndex) => {
        const isCorrect = optIndex === correctIndex;
        console.log(`    Resposta ${optIndex}: ${isCorrect ? '✅ CORRETA' : '❌ INCORRETA'}`);
      });
    });
    
    // Simular o processo de validação
    console.log('\n🎯 Simulando processo de validação...');
    const testAnswers = [2, 3]; // Respostas que o usuário selecionou
    
    testAnswers.forEach((answer, index) => {
      if (index < quiz.questions.length) {
        const question = quiz.questions[index];
        const correctIndex = question.options.findIndex(opt => opt.isCorrect === true);
        const isCorrect = answer === correctIndex;
        
        console.log(`\n📝 Questão ${index + 1}:`);
        console.log(`  Resposta do usuário: ${answer}`);
        console.log(`  Resposta correta: ${correctIndex}`);
        console.log(`  Resultado: ${isCorrect ? '✅ CORRETA' : '❌ INCORRETA'}`);
        console.log(`  Comparação: ${answer} === ${correctIndex} = ${answer === correctIndex}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao testar validação:', error);
  } finally {
    mongoose.connection.close();
  }
}

testQuizValidation();
