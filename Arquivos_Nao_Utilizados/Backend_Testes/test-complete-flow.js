const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao banco de dados
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/notemusic');

// Importar modelo
const Quiz = require('./src/models/Quiz');

async function testCompleteFlow() {
  try {
    console.log('🧪 Testando fluxo completo: carregar quiz, validar e submeter...');
    
    // 1. SIMULAR getQuizByModule (o que o frontend recebe)
    console.log('\n📥 1. SIMULANDO getQuizByModule (frontend recebe):');
    const quiz = await Quiz.findById('689d1cbca9442adf708f40c8');
    
    if (!quiz) {
      console.log('❌ Quiz não encontrado');
      return;
    }
    
    // Simular o que o frontend recebe (sem isCorrect)
    const frontendQuiz = {
      id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      category: quiz.category,
      questions: quiz.questions.map((question, questionIndex) => ({
        _id: question._id || `q_${questionIndex}`,
        question: question.question,
        options: question.options.map((option, optionIndex) => ({
          id: option.id || option._id || `opt_${questionIndex}_${optionIndex}`,
          label: option.label,
          // Não incluir isCorrect na resposta para segurança
        })),
        explanation: question.explanation,
        category: question.category || quiz.category,
        difficulty: question.difficulty || 'medio',
        points: question.points || 10
      })),
      timeLimit: quiz.timeLimit || 300,
      level: quiz.level,
      type: quiz.type || 'module'
    };
    
    console.log('  Quiz enviado para frontend:');
    console.log(`    ID: ${frontendQuiz.id}`);
    console.log(`    Título: ${frontendQuiz.title}`);
    console.log(`    Total de questões: ${frontendQuiz.questions.length}`);
    frontendQuiz.questions.forEach((q, idx) => {
      console.log(`    Questão ${idx + 1}: ${q.question}`);
      console.log(`      Opções:`, q.options.map((opt, optIdx) => `${optIdx}: "${opt.label}"`));
    });
    
    // 2. SIMULAR validação individual (validateQuestion)
    console.log('\n🔍 2. SIMULANDO validação individual (validateQuestion):');
    const userAnswers = [2, 3]; // Respostas que o usuário selecionou
    const validationResults = [];
    
    for (let i = 0; i < userAnswers.length; i++) {
      const questionIndex = i;
      const selectedAnswer = userAnswers[i];
      
      // Simular o que o backend faz na validação
      const question = quiz.questions[questionIndex];
      const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
      const isCorrect = Number(selectedAnswer) === correctOptionIndex;
      
      console.log(`\n  Questão ${questionIndex + 1}:`);
      console.log(`    Questão: ${question.question}`);
      console.log(`    Resposta do usuário: ${selectedAnswer}`);
      console.log(`    Opção correta: ${correctOptionIndex}`);
      console.log(`    Resultado: ${isCorrect ? '✅ CORRETA' : '❌ INCORRETA'}`);
      console.log(`    Opções disponíveis:`, question.options.map((opt, optIdx) => ({
        index: optIdx,
        label: opt.label,
        isCorrect: opt.isCorrect
      })));
      
      validationResults.push({
        questionIndex,
        selectedAnswer,
        isCorrect,
        correctOptionIndex
      });
    }
    
    // 3. SIMULAR submissão final (submitQuizPrivate)
    console.log('\n📤 3. SIMULANDO submissão final (submitQuizPrivate):');
    
    // Simular exatamente o que o backend faz na submissão
    const totalQuestions = quiz.questions.length;
    let score = 0;
    const correctAnswers = [];
    const userAnswersFinal = [];
    
    console.log('  Processando respostas na submissão:');
    for (let i = 0; i < userAnswers.length && i < totalQuestions; i++) {
      const userAnswer = Number(userAnswers[i]);
      const question = quiz.questions[i];
      
      console.log(`\n  Questão ${i + 1}:`);
      console.log(`    Questão: ${question.question}`);
      console.log(`    Resposta do usuário: ${userAnswer}`);
      console.log(`    Opções disponíveis:`, question.options.map((opt, optIdx) => ({
        index: optIdx,
        label: opt.label,
        isCorrect: opt.isCorrect
      })));
      
      if (question && question.options && question.options.length > 0) {
        const correctOptionIndex = question.options.findIndex(opt => opt.isCorrect === true);
        
        console.log(`    Índice da opção correta: ${correctOptionIndex}`);
        
        correctAnswers.push(correctOptionIndex);
        userAnswersFinal.push(userAnswer);
        
        if (correctOptionIndex !== -1 && userAnswer === correctOptionIndex) {
          score++;
          console.log(`    ✅ CORRETA! Usuário: ${userAnswer}, Correto: ${correctOptionIndex}`);
        } else {
          console.log(`    ❌ INCORRETA! Usuário: ${userAnswer}, Correto: ${correctOptionIndex}`);
          console.log(`    Comparação: ${userAnswer} === ${correctOptionIndex} = ${userAnswer === correctOptionIndex}`);
        }
      }
    }
    
    // 4. RESUMO E COMPARAÇÃO
    console.log('\n📊 4. RESUMO E COMPARAÇÃO:');
    console.log('  Validação individual:');
    validationResults.forEach((result, idx) => {
      console.log(`    Questão ${idx + 1}: ${result.isCorrect ? '✅' : '❌'}`);
    });
    
    console.log('\n  Submissão final:');
    console.log(`    Score: ${score}/${totalQuestions}`);
    console.log(`    Respostas do usuário: ${userAnswersFinal}`);
    console.log(`    Respostas corretas: ${correctAnswers}`);
    
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    console.log(`    Percentual: ${percentage}%`);
    
    // 5. VERIFICAR INCONSISTÊNCIAS
    console.log('\n🔍 5. VERIFICAÇÃO DE INCONSISTÊNCIAS:');
    const correctValidations = validationResults.filter(r => r.isCorrect).length;
    const correctSubmissions = score;
    
    console.log(`  Validações corretas: ${correctValidations}`);
    console.log(`  Submissões corretas: ${correctSubmissions}`);
    
    if (correctValidations !== correctSubmissions) {
      console.log('\n⚠️ PROBLEMA IDENTIFICADO:');
      console.log(`  Diferença entre validação e submissão: ${correctValidations - correctSubmissions}`);
      console.log(`  Validação individual: ${correctValidations}/${totalQuestions}`);
      console.log(`  Submissão final: ${correctSubmissions}/${totalQuestions}`);
    } else {
      console.log('\n✅ Nenhuma inconsistência encontrada!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar fluxo completo:', error);
  } finally {
    mongoose.connection.close();
  }
}

testCompleteFlow();
