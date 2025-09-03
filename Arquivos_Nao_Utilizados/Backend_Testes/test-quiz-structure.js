const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao banco de dados
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');

// Importar modelo
const Quiz = require('./src/models/Quiz');

async function testQuizStructure() {
  try {
    console.log('🔍 Testando estrutura dos dados do quiz...');
    
    // Buscar todos os quizzes
    const quizzes = await Quiz.find({});
    console.log(`📊 Total de quizzes encontrados: ${quizzes.length}`);
    
    quizzes.forEach((quiz, quizIndex) => {
      console.log(`\n📝 Quiz ${quizIndex + 1}: ${quiz.title}`);
      console.log(`  ID: ${quiz._id}`);
      console.log(`  Módulo: ${quiz.moduleId}`);
      console.log(`  Total de questões: ${quiz.questions.length}`);
      
      quiz.questions.forEach((question, qIndex) => {
        console.log(`\n  Questão ${qIndex + 1}: ${question.question}`);
        console.log(`    Opções:`);
        
        question.options.forEach((option, optIndex) => {
          console.log(`      ${optIndex}: "${option.label}" - isCorrect: ${option.isCorrect}`);
        });
        
        // Verificar se há exatamente uma opção correta
        const correctOptions = question.options.filter(opt => opt.isCorrect === true);
        if (correctOptions.length !== 1) {
          console.log(`    ⚠️ PROBLEMA: ${correctOptions.length} opções corretas encontradas (deveria ser 1)`);
        }
      });
    });
    
    // Testar validação específica
    if (quizzes.length > 0) {
      const testQuiz = quizzes[0];
      console.log(`\n🧪 Testando validação para quiz: ${testQuiz.title}`);
      
      testQuiz.questions.forEach((question, qIndex) => {
        const correctIndex = question.options.findIndex(opt => opt.isCorrect === true);
        console.log(`  Questão ${qIndex + 1}: Opção correta no índice ${correctIndex}`);
        
        // Testar todas as opções
        question.options.forEach((option, optIndex) => {
          const isCorrect = optIndex === correctIndex;
          console.log(`    Opção ${optIndex}: ${option.label} - isCorrect: ${option.isCorrect} (esperado: ${isCorrect})`);
          
          if (option.isCorrect !== isCorrect) {
            console.log(`    ❌ PROBLEMA: Opção ${optIndex} tem isCorrect incorreto!`);
          }
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar estrutura:', error);
  } finally {
    mongoose.connection.close();
  }
}

testQuizStructure();
