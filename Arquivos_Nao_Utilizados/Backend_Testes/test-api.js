const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  try {
    console.log('🧪 Testando API NoteMusic...');
    
    // Teste 1: Health Check
    console.log('\n1. Testando Health Check...');
    const healthResponse = await fetch('http://localhost:3333/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
    
    // Teste 2: Login
    console.log('\n2. Testando Login...');
    const loginResponse = await fetch('http://localhost:3333/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'teste@notemusic.com',
        password: 'senha123'
      })
    });
    
    let token = null;
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      token = loginData.token;
      console.log('✅ Login bem-sucedido:', {
        user: loginData.user.name,
        level: loginData.user.level,
        token: token ? 'Recebido' : 'Não recebido'
      });
    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Erro no login:', errorData);
      return;
    }
    
    // Teste 3: Obter módulos
    console.log('\n3. Testando obtenção de módulos...');
    const modulesResponse = await fetch('http://localhost:3333/api/modules');
    if (modulesResponse.ok) {
      const modulesData = await modulesResponse.json();
      console.log(`✅ Módulos obtidos: ${modulesData.count} módulos disponíveis`);
      console.log('   Primeiros módulos:', modulesData.modules.slice(0, 3).map(m => m.title));
    } else {
      console.log('❌ Erro ao obter módulos');
    }
    
    // Teste 4: Obter categorias
    console.log('\n4. Testando obtenção de categorias...');
    const categoriesResponse = await fetch('http://localhost:3333/api/modules/categories');
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      console.log(`✅ Categorias obtidas: ${categoriesData.categories.length} categorias`);
      console.log('   Categorias:', categoriesData.categories.map(c => c.name));
    } else {
      console.log('❌ Erro ao obter categorias');
    }
    
    // Teste 5: Desafio diário (público)
    console.log('\n5. Testando desafio diário (público)...');
    const dailyChallengeResponse = await fetch('http://localhost:3333/api/quiz/daily-challenge');
    if (dailyChallengeResponse.ok) {
      const dailyChallengeData = await dailyChallengeResponse.json();
      console.log('✅ Desafio diário obtido:', {
        title: dailyChallengeData.title,
        questions: dailyChallengeData.questions.length,
        isDailyChallenge: dailyChallengeData.isDailyChallenge
      });
    } else {
      console.log('❌ Erro ao obter desafio diário');
    }
    
    // Teste 6: Quiz público
    console.log('\n6. Testando quiz público...');
    const quizResponse = await fetch('http://localhost:3333/api/quiz/689d155fbc5b447ac18fdee3');
    if (quizResponse.ok) {
      const quizData = await quizResponse.json();
      console.log('✅ Quiz obtido:', {
        title: quizData.title,
        questions: quizData.questions.length,
        level: quizData.level
      });
      
      // Teste 7: Submeter quiz
      console.log('\n7. Testando submissão de quiz...');
      const submitResponse = await fetch('http://localhost:3333/api/quiz/689d155fbc5b447ac18fdee3/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: [3, 2, 0], // Respostas corretas: Si (3), 7 notas (2), Volume alto (0)
          timeSpent: 120
        })
      });
      
      if (submitResponse.ok) {
        const submitData = await submitResponse.json();
        console.log('✅ Quiz submetido (respostas corretas):', {
          score: submitData.score,
          total: submitData.total,
          percentage: submitData.percentage,
          feedback: submitData.feedback
        });
      } else {
        const errorData = await submitResponse.json();
        console.log('❌ Erro ao submeter quiz:', errorData);
      }

      // Teste 7b: Submeter quiz com respostas incorretas
      console.log('\n7b. Testando submissão com respostas incorretas...');
      const submitWrongResponse = await fetch('http://localhost:3333/api/quiz/689d155fbc5b447ac18fdee3/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: [0, 1, 2], // Respostas incorretas: Dó (0), 6 notas (1), Velocidade rápida (2)
          timeSpent: 90
        })
      });
      
      if (submitWrongResponse.ok) {
        const submitWrongData = await submitWrongResponse.json();
        console.log('✅ Quiz submetido (respostas incorretas):', {
          score: submitWrongData.score,
          total: submitWrongData.total,
          percentage: submitWrongData.percentage,
          feedback: submitWrongData.feedback
        });
      } else {
        const errorData = await submitWrongResponse.json();
        console.log('❌ Erro ao submeter quiz com respostas incorretas:', errorData);
      }

      // Teste 7c: Simular problema do frontend (respostas como usuário real)
      console.log('\n7c. Simulando problema do frontend...');
      const submitFrontendResponse = await fetch('http://localhost:3333/api/quiz/689d155fbc5b447ac18fdee3/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: [0, 1], // Simulando respostas do usuário: Dó (0), 6 notas (1)
          timeSpent: 60
        })
      });
      
      if (submitFrontendResponse.ok) {
        const submitFrontendData = await submitFrontendResponse.json();
        console.log('🔍 Simulação do frontend:', {
          score: submitFrontendData.score,
          total: submitFrontendData.total,
          percentage: submitFrontendData.percentage,
          feedback: submitFrontendData.feedback,
          userAnswers: submitFrontendData.userAnswers,
          correctAnswers: submitFrontendData.correctAnswers
        });
      } else {
        const errorData = await submitFrontendResponse.json();
        console.log('❌ Erro na simulação do frontend:', errorData);
      }

      // Teste 7d: Simular problema específico do usuário (quiz de 2 questões)
      console.log('\n7d. Simulando problema específico do usuário...');
      
      // Primeiro, obter o desafio diário (que tem 2 questões)
      const dailyQuizResponse = await fetch('http://localhost:3333/api/quiz/daily-challenge');
      if (dailyQuizResponse.ok) {
        const dailyQuizData = await dailyQuizResponse.json();
        console.log('📋 Desafio diário obtido:', {
          title: dailyQuizData.title,
          questions: dailyQuizData.questions.length,
          quizId: dailyQuizData._id || 'daily-challenge-mock'
        });
        
        // Simular usuário acertando as 2 questões
        const submitDailyResponse = await fetch('http://localhost:3333/api/quiz/daily-challenge/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            answers: [0, 1], // Simulando usuário acertando as 2 questões
            timeSpent: 45
          })
        });
        
        if (submitDailyResponse.ok) {
          const submitDailyData = await submitDailyResponse.json();
          console.log('🔍 Resultado do desafio diário:', {
            score: submitDailyData.score,
            total: submitDailyData.total,
            percentage: submitDailyData.percentage,
            feedback: submitDailyData.feedback,
            userAnswers: submitDailyData.userAnswers,
            correctAnswers: submitDailyData.correctAnswers
          });
        } else {
          const errorData = await submitDailyResponse.json();
          console.log('❌ Erro no desafio diário:', errorData);
        }
      }
    } else {
      console.log('❌ Erro ao obter quiz');
    }
    
    // Teste 8: Estatísticas de gamificação
    console.log('\n8. Testando estatísticas de gamificação...');
    const statsResponse = await fetch('http://localhost:3333/api/gamification/stats');
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ Estatísticas obtidas:', {
        level: statsData.stats.level,
        progress: statsData.stats.progress,
        totalModules: statsData.stats.totalModules
      });
    } else {
      console.log('❌ Erro ao obter estatísticas');
    }
    
    // Teste 9: Esqueci minha senha
    console.log('\n9. Testando funcionalidade "Esqueci minha senha"...');
    const forgotPasswordResponse = await fetch('http://localhost:3333/api/auth/forgotpassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'teste@notemusic.com'
      })
    });
    
    if (forgotPasswordResponse.ok) {
      const forgotPasswordData = await forgotPasswordResponse.json();
      console.log('✅ Solicitação de redefinição:', {
        message: forgotPasswordData.message,
        expiresIn: forgotPasswordData.expiresIn,
        tempPassword: forgotPasswordData.tempPassword ? 'Gerada' : 'Não mostrada'
      });
    } else {
      const errorData = await forgotPasswordResponse.json();
      console.log('❌ Erro na solicitação de redefinição:', errorData);
    }
    
    console.log('\n🎉 Todos os testes concluídos!');
    console.log('\n📝 Resumo dos testes:');
    console.log('   ✅ Health Check');
    console.log('   ✅ Login de usuário');
    console.log('   ✅ Obtenção de módulos');
    console.log('   ✅ Obtenção de categorias');
    console.log('   ✅ Desafio diário público');
    console.log('   ✅ Quiz público');
    console.log('   ✅ Submissão de quiz');
    console.log('   ✅ Estatísticas de gamificação');
    console.log('   ✅ Funcionalidade "Esqueci minha senha"');
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error.message);
  }
}

testAPI(); 