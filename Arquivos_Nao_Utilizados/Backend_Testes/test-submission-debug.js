const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao banco de dados
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');

// Importar modelo
const Quiz = require('./src/models/Quiz');

async function testSubmissionDebug() {
  try {
    console.log('🧪 Testando debug da submissão do quiz...');
    
    // Buscar o quiz específico que está sendo usado
    const quiz = await Quiz.findById('689d1cbca9442adf708f40c8');
    
    if (!quiz) {
      console.log('❌ Quiz não encontrado');
      return;
    }
    
    console.log(`📝 Quiz: ${quiz.title}`);
    console.log(`  ID: ${quiz._id}`);
    console.log(`  Total de questões: ${quiz.questions.length}`);
    
    // Simular exatamente o que o backend faz na submissão
    console.log('\n🎯 Simulando submissão (submitQuizPrivate)...');
    
    const answers = [2, 3]; // Respostas que o usuário selecionou
    const totalQuestions = quiz.questions.length;
    let score = 0;
    const correctAnswers = [];
    const userAnswers = [];
    
    console.log('🔍 INÍCIO DO PROCESSAMENTO DAS RESPOSTAS:');
    console.log('  Total de questões:', totalQuestions);
    console.log('  Respostas recebidas:', answers);
    
    for (let i = 0; i < answers.length && i < totalQuestions; i++) {
      const userAnswer = Number(answers[i]); // Converter para número
      const question = quiz.questions[i];
      
      console.log(`\n📝 Processando questão ${i + 1}:`);
      console.log(`  Questão: ${question.question}`);
      console.log(`  Resposta do usuário (original): ${answers[i]} (tipo: ${typeof answers[i]})`);
      console.log(`  Resposta do usuário (convertida): ${userAnswer} (tipo: ${typeof userAnswer})`);
      console.log(`  Opções disponíveis:`, question.options.map((opt, optIdx) => ({
        index: optIdx,
        label: opt.label,
        isCorrect: opt.isCorrect
      })));
      
      if (question && question.options && question.options.length > 0) {
        const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
        
        console.log(`  Índice da opção correta: ${correctOptionIndex}`);
        
        // Adicionar às listas para debug
        correctAnswers.push(correctOptionIndex);
        userAnswers.push(userAnswer);
        
        // Verificar se a resposta está correta (comparar índices)
        if (correctOptionIndex !== -1 && userAnswer === correctOptionIndex) {
          score++;
          console.log(`✅ Questão ${i + 1}: CORRETA! Usuário: ${userAnswer}, Correto: ${correctOptionIndex}`);
        } else {
          console.log(`❌ Questão ${i + 1}: INCORRETA! Usuário: ${userAnswer}, Correto: ${correctOptionIndex}`);
          console.log(`  Comparação: ${userAnswer} === ${correctOptionIndex} = ${userAnswer === correctOptionIndex}`);
        }
      } else {
        console.log(`⚠️ Questão ${i + 1}: Estrutura inválida ou sem opções`);
      }
    }
    
    console.log('\n📊 RESUMO DO PROCESSAMENTO:');
    console.log(`  Score final: ${score}/${totalQuestions}`);
    console.log(`  Respostas do usuário: ${userAnswers}`);
    console.log(`  Respostas corretas: ${correctAnswers}`);
    
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    console.log(`  Percentual: ${percentage}%`);
    
    // Verificar se há inconsistência
    if (score !== answers.length) {
      console.log('\n⚠️ PROBLEMA IDENTIFICADO:');
      console.log(`  Respostas enviadas: ${answers.length}`);
      console.log(`  Score calculado: ${score}`);
      console.log(`  Diferença: ${answers.length - score}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar submissão:', error);
  } finally {
    mongoose.connection.close();
  }
}

testSubmissionDebug();
